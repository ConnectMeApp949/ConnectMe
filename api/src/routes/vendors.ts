import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import stripe from '../lib/stripe';
import { sendError, sendSuccess } from '../lib/errors';
import { handleValidation } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// ─── Multer config ───────────────────────────────────────
// TODO: Swap local storage for S3 (aws-sdk/client-s3) in production

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

// ─── Helpers ─────────────────────────────────────────────

const VALID_CATEGORIES = [
  'FOOD_TRUCK', 'DJ', 'CATERING', 'WEDDING_SERVICES',
  'PHOTOGRAPHY', 'ENTERTAINMENT', 'EXPERIENCES', 'WELLNESS', 'BEVERAGES', 'ARTISTRY', 'OTHER',
];
const VALID_PRICE_UNITS = ['PER_HOUR', 'PER_EVENT', 'CUSTOM'];

const PUBLIC_PROFILE_SELECT = {
  id: true,
  businessName: true,
  category: true,
  bio: true,
  coverPhoto: true,
  portfolioPhotos: true,
  basePrice: true,
  priceUnit: true,
  city: true,
  state: true,
  serviceRadius: true,
  isActive: true,
  averageRating: true,
  totalReviews: true,
  totalBookings: true,
  createdAt: true,
  user: { select: { id: true, firstName: true, lastName: true, profilePhoto: true, isVerified: true } },
};

// ─── POST /vendors/profile ───────────────────────────────

router.post(
  '/profile',
  authenticate,
  [
    body('businessName').trim().notEmpty().withMessage('Business name is required'),
    body('category').isIn(VALID_CATEGORIES).withMessage('Invalid category'),
    body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be 1000 chars or less'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
    body('priceUnit').isIn(VALID_PRICE_UNITS).withMessage('Invalid price unit'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('serviceRadius').isInt({ min: 1, max: 500 }).withMessage('Service radius must be 1–500 miles'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;

      if (req.user!.userType !== 'VENDOR') {
        sendError(res, { status: 403, code: 'FORBIDDEN', message: 'Only vendor accounts can create a vendor profile' });
        return;
      }

      const existing = await prisma.vendorProfile.findUnique({ where: { userId } });
      if (existing) {
        sendError(res, { status: 409, code: 'PROFILE_EXISTS', message: 'Vendor profile already exists' });
        return;
      }

      const { businessName, category, bio, basePrice, priceUnit, city, state, serviceRadius } = req.body;

      const profile = await prisma.vendorProfile.create({
        data: {
          userId,
          businessName,
          category,
          bio: bio || null,
          basePrice,
          priceUnit,
          city,
          state,
          serviceRadius: parseInt(serviceRadius),
          portfolioPhotos: [],
        },
        select: PUBLIC_PROFILE_SELECT,
      });

      sendSuccess(res, profile, 201);
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to create vendor profile' });
    }
  }
);

// ─── PUT /vendors/profile ────────────────────────────────

router.put(
  '/profile',
  authenticate,
  [
    body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
    body('category').optional().isIn(VALID_CATEGORIES).withMessage('Invalid category'),
    body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be 1000 chars or less'),
    body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
    body('priceUnit').optional().isIn(VALID_PRICE_UNITS).withMessage('Invalid price unit'),
    body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
    body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
    body('serviceRadius').optional().isInt({ min: 1, max: 500 }).withMessage('Service radius must be 1–500 miles'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;

      const existing = await prisma.vendorProfile.findUnique({ where: { userId } });
      if (!existing) {
        sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
        return;
      }

      const allowedFields = ['businessName', 'category', 'bio', 'basePrice', 'priceUnit', 'city', 'state', 'serviceRadius'];
      const updates: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = field === 'serviceRadius' ? parseInt(req.body[field]) : req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        sendError(res, { status: 400, code: 'NO_UPDATES', message: 'No valid fields to update' });
        return;
      }

      const profile = await prisma.vendorProfile.update({
        where: { userId },
        data: updates,
        select: PUBLIC_PROFILE_SELECT,
      });

      sendSuccess(res, profile);
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to update vendor profile' });
    }
  }
);

// ─── POST /vendors/profile/photos ────────────────────────

router.post(
  '/profile/photos',
  authenticate,
  upload.array('photos', 10),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        sendError(res, { status: 400, code: 'NO_FILES', message: 'At least one photo is required' });
        return;
      }

      const profile = await prisma.vendorProfile.findUnique({ where: { userId } });
      if (!profile) {
        sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
        return;
      }

      if (profile.portfolioPhotos.length + files.length > 10) {
        sendError(res, { status: 400, code: 'TOO_MANY_PHOTOS', message: 'Maximum 10 portfolio photos allowed' });
        return;
      }

      // TODO: Upload to S3 and return CDN URLs instead of local paths
      const newUrls = files.map((f) => `/uploads/${f.filename}`);

      const updated = await prisma.vendorProfile.update({
        where: { userId },
        data: { portfolioPhotos: { push: newUrls } },
        select: { portfolioPhotos: true },
      });

      sendSuccess(res, { photos: updated.portfolioPhotos });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to upload photos' });
    }
  }
);

// ─── DELETE /vendors/profile/photos/:photoId ─────────────

router.delete(
  '/profile/photos/:photoId',
  authenticate,
  [param('photoId').notEmpty().withMessage('Photo ID is required')],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { photoId } = req.params;

      const profile = await prisma.vendorProfile.findUnique({ where: { userId } });
      if (!profile) {
        sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
        return;
      }

      const photoUrl = profile.portfolioPhotos.find((p) => p.includes(photoId as string));
      if (!photoUrl) {
        sendError(res, { status: 404, code: 'PHOTO_NOT_FOUND', message: 'Photo not found in portfolio' });
        return;
      }

      // Remove from DB
      const updatedPhotos = profile.portfolioPhotos.filter((p) => p !== photoUrl);
      await prisma.vendorProfile.update({
        where: { userId },
        data: { portfolioPhotos: updatedPhotos },
      });

      // Remove file from disk
      const filePath = path.resolve(UPLOADS_DIR, path.basename(photoUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      sendSuccess(res, { message: 'Photo removed', photos: updatedPhotos });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to delete photo' });
    }
  }
);

// ─── GET /vendors/me ─────────────────────────────────────

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const profile = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, profilePhoto: true } },
        subscriptions: { where: { isActive: true }, take: 1 },
      },
    });

    if (!profile) {
      sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
      return;
    }

    // Compute lifetime earnings
    const earnings = await prisma.payment.aggregate({
      where: {
        booking: { vendorId: profile.id },
        status: 'COMPLETED',
      },
      _sum: { vendorPayout: true },
    });

    sendSuccess(res, {
      ...profile,
      totalEarnings: earnings._sum.vendorPayout ?? 0,
    });
  } catch (err) {
    sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' });
  }
});

// ─── GET /vendors/search ─────────────────────────────────

router.get(
  '/search',
  [
    query('category').optional().isIn(VALID_CATEGORIES).withMessage('Invalid category'),
    query('city').optional().trim(),
    query('date').optional().isISO8601().withMessage('Date must be ISO 8601 format'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be >= 0'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be >= 0'),
    query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('minRating must be 0–5'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  ],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = 20;
      const skip = (page - 1) * perPage;

      const where: any = { isActive: true };

      if (req.query.category) where.category = req.query.category;
      if (req.query.city) where.city = { contains: String(req.query.city), mode: 'insensitive' };
      if (req.query.minPrice || req.query.maxPrice) {
        where.basePrice = {};
        if (req.query.minPrice) where.basePrice.gte = parseFloat(req.query.minPrice as string);
        if (req.query.maxPrice) where.basePrice.lte = parseFloat(req.query.maxPrice as string);
      }
      if (req.query.minRating) where.averageRating = { gte: parseFloat(req.query.minRating as string) };

      // If date provided, exclude vendors with confirmed bookings on that date
      if (req.query.date) {
        const searchDate = new Date(req.query.date as string);
        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);

        where.bookings = {
          none: {
            eventDate: { gte: searchDate, lt: nextDay },
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
        };
      }

      const [vendors, total] = await Promise.all([
        prisma.vendorProfile.findMany({
          where,
          select: PUBLIC_PROFILE_SELECT,
          orderBy: [
            { createdAt: 'desc' },
            { averageRating: 'desc' },
            { totalReviews: 'desc' },
          ],
          skip,
          take: perPage,
        }),
        prisma.vendorProfile.count({ where }),
      ]);

      sendSuccess(res, vendors, 200, {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Search failed' });
    }
  }
);

// ─── GET /vendors/:vendorId ──────────────────────────────

router.get(
  '/:vendorId',
  [param('vendorId').notEmpty().withMessage('Vendor ID is required')],
  handleValidation,
  async (req: Request, res: Response) => {
    try {
      const { vendorId } = req.params;

      const profile = await prisma.vendorProfile.findUnique({
        where: { id: vendorId as string },
        select: PUBLIC_PROFILE_SELECT,
      });

      if (!profile) {
        sendError(res, { status: 404, code: 'VENDOR_NOT_FOUND', message: 'Vendor not found' });
        return;
      }

      const recentReviews = await prisma.review.findMany({
        where: { booking: { vendorId: vendorId as string } },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          client: { select: { firstName: true, lastName: true, profilePhoto: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      sendSuccess(res, { ...profile, recentReviews });
    } catch (err) {
      sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to fetch vendor profile' });
    }
  }
);

// ─── POST /vendors/connect/onboard ───────────────────────

router.post('/connect/onboard', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!vendor) {
      sendError(res, { status: 404, code: 'PROFILE_NOT_FOUND', message: 'Vendor profile not found' });
      return;
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: vendor.user.email,
      metadata: { vendorId: vendor.id, userId },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // TODO: Store account.id on vendor profile (add stripeConnectAccountId field)

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.APP_URL || 'http://localhost:3000'}/connect/refresh`,
      return_url: `${process.env.APP_URL || 'http://localhost:3000'}/connect/complete`,
      type: 'account_onboarding',
    });

    sendSuccess(res, {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (err) {
    console.error('Connect onboard error:', err);
    sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to create Connect account' });
  }
});

// ─── GET /vendors/connect/status ─────────────────────────

router.get('/connect/status', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // TODO: Read stripeConnectAccountId from vendor profile
    const connectAccountId = `acct_placeholder_${userId}`;

    try {
      const account = await stripe.accounts.retrieve(connectAccountId);

      sendSuccess(res, {
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        onboardingComplete: account.charges_enabled && account.payouts_enabled,
      });
    } catch {
      sendSuccess(res, {
        accountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        onboardingComplete: false,
      });
    }
  } catch (err) {
    sendError(res, { status: 500, code: 'INTERNAL_ERROR', message: 'Failed to check Connect status' });
  }
});

export default router;
