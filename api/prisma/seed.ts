import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

faker.seed(42); // Deterministic for reproducible demo data

// ─── San Antonio–specific data ───────────────────────────

const SA_NEIGHBORHOODS = [
  'Pearl District', 'Southtown', 'King William', 'Alamo Heights', 'Monte Vista',
  'Stone Oak', 'La Cantera', 'Helotes', 'Boerne', 'The Dominion',
  'Downtown', 'Tobin Hill', 'Olmos Park', 'Terrell Hills', 'Shavano Park',
];

const SA_VENUES = [
  'the Majestic Theatre', 'the McNay Art Museum', 'La Villita',
  'the San Antonio Botanical Garden', 'the Witte Museum', 'the Tobin Center',
  'Sunset Station', 'the Briscoe Western Art Museum', 'Mission San José',
  'the San Antonio River Walk', 'Hemisfair Park', 'the Pearl Brewery',
];

const EVENT_TYPES = ['Wedding', 'Birthday', 'Corporate', 'Quinceañera', 'Festival', 'Private Party', 'Graduation', 'Anniversary'];

// ─── Vendor templates per category ───────────────────────

interface VendorTemplate {
  names: string[];
  bioGen: () => string;
  priceRange: [number, number];
  priceUnit: 'PER_HOUR' | 'PER_EVENT' | 'CUSTOM';
}

const VENDOR_TEMPLATES: Record<string, VendorTemplate> = {
  FOOD_TRUCK: {
    names: [
      'Taco Libre SA', 'Smoke Shack on Wheels', 'La Parrilla Móvil', 'Brisket Boss TX',
      'Churro Kingdom', 'The Elote Stand', 'SA Slider Co.', 'Birria Bandits',
      'Puro Tacos SA', 'BBQ Wagon Co.', 'Street Corn Express', 'Fajita Fiesta Truck',
    ],
    bioGen: () => {
      const neighborhood = faker.helpers.arrayElement(SA_NEIGHBORHOODS);
      const years = faker.number.int({ min: 2, max: 12 });
      return `Serving authentic San Antonio street food for ${years} years. Based out of ${neighborhood}, we bring bold Tex-Mex flavors to your event. From weddings on the River Walk to corporate events at ${faker.helpers.arrayElement(SA_VENUES)}, we've fed thousands of hungry San Antonians. Our menu features scratch-made tortillas, slow-smoked meats, and family recipes passed down through generations. We love Fiesta season and are proud to be a local SA favorite.`;
    },
    priceRange: [400, 1200],
    priceUnit: 'PER_EVENT',
  },
  DJ: {
    names: [
      'DJ Alamo Beats', 'SA Sound System', 'Puro Party DJs', 'Fiesta Frequency',
      'Lone Star DJ Co.', 'RiverCity Remix', 'DJ Cumbia King', 'Alamo City DJs',
      'SA Groove Collective', 'Tejano Turntable',
    ],
    bioGen: () => {
      const years = faker.number.int({ min: 3, max: 15 });
      const venue = faker.helpers.arrayElement(SA_VENUES);
      return `Professional DJ and emcee with ${years} years of experience rocking events across San Antonio. Specializing in bilingual events — seamlessly mixing Tejano, cumbia, hip-hop, country, and Top 40. I've performed at ${venue}, Fiesta events, and over 200 weddings in the SA area. Full sound system, lighting, and wireless mic included. I read the room and keep your dance floor packed from first dance to last call.`;
    },
    priceRange: [300, 800],
    priceUnit: 'PER_EVENT',
  },
  CATERING: {
    names: [
      'Alamo City Catering', 'Pearl District Kitchen', 'Southtown Bites', 'Hill Country Platters',
      'SA Elegant Catering', 'Fiesta Flavors Catering', 'Mission City Meals', 'The Banquet Co. SA',
      'Riverwalk Catering Group', 'Texas Table Catering',
    ],
    bioGen: () => {
      const years = faker.number.int({ min: 5, max: 20 });
      return `Full-service catering company proudly serving San Antonio for ${years} years. We specialize in Tex-Mex fusion, traditional Texas BBQ, and elegant plated dinners. From intimate ${faker.helpers.arrayElement(SA_NEIGHBORHOODS)} dinner parties to 500-guest galas at ${faker.helpers.arrayElement(SA_VENUES)}, we handle it all — setup, staffing, linens, and cleanup. Our executive chef trained in Austin and brings farm-to-table philosophy to every plate. Licensed and insured with a perfect health inspection record.`;
    },
    priceRange: [1500, 5000],
    priceUnit: 'PER_EVENT',
  },
  WEDDING_SERVICES: {
    names: [
      'SA Forever Events', 'Hill Country Weddings', 'The Knot SA', 'Blissful Beginnings SA',
      'Alamo Bridal Co.', 'Mission City Weddings', 'Puro Love Events', 'Texas Vow Planners',
    ],
    bioGen: () => {
      const weddings = faker.number.int({ min: 50, max: 300 });
      return `We've planned and coordinated ${weddings}+ weddings across San Antonio and the Texas Hill Country. From intimate ceremonies at the Spanish Governor's Palace to grand receptions at ${faker.helpers.arrayElement(SA_VENUES)}, we make your vision a reality. Full-service planning, day-of coordination, or à la carte — we tailor our services to your needs and budget. Bilingual team fluent in English and Spanish. Featured in SA Weddings Magazine and The Knot Texas.`;
    },
    priceRange: [2000, 8000],
    priceUnit: 'CUSTOM',
  },
  PHOTOGRAPHY: {
    names: [
      'Lens & Light SA', 'Alamo Portraits', 'SA Shutter Co.', 'Riverwalk Photography',
      'Fiesta Frame Studio', 'Puro Pics SA',
    ],
    bioGen: () => {
      const years = faker.number.int({ min: 3, max: 12 });
      return `Award-winning photographer based in ${faker.helpers.arrayElement(SA_NEIGHBORHOODS)}, San Antonio. ${years} years capturing weddings, quinceañeras, corporate headshots, and family portraits. My style blends candid photojournalism with cinematic posed shots — natural light whenever possible, with ${faker.helpers.arrayElement(SA_VENUES)} being one of my favorite locations to shoot. Turnaround is 2-3 weeks with a private online gallery. Drone photography available for outdoor events.`;
    },
    priceRange: [500, 2500],
    priceUnit: 'PER_HOUR',
  },
  ENTERTAINMENT: {
    names: [
      'SA Party Pros', 'Fiesta Entertainment Group', 'Alamo Fun Factory', 'Puro Fun SA',
    ],
    bioGen: () => {
      return `San Antonio's premier event entertainment company! We bring the party to you — photo booths, bounce houses, carnival games, balloon artists, face painters, magicians, and live mariachi bands. Perfect for birthday parties in ${faker.helpers.arrayElement(SA_NEIGHBORHOODS)}, corporate team-building at ${faker.helpers.arrayElement(SA_VENUES)}, and Fiesta celebrations. Fully insured with background-checked staff. We've entertained at over 1,000 SA events and counting. Packages available or build your own custom experience.`;
    },
    priceRange: [300, 2000],
    priceUnit: 'PER_EVENT',
  },
};

const CATEGORY_COUNTS: Record<string, number> = {
  FOOD_TRUCK: 12, DJ: 10, CATERING: 10, WEDDING_SERVICES: 8, PHOTOGRAPHY: 6, ENTERTAINMENT: 4,
};

// ─── Helpers ─────────────────────────────────────────────

const PASSWORD_HASH = bcrypt.hashSync('demo1234', 12);

function randomRating(): number {
  return parseFloat((faker.number.float({ min: 4.1, max: 5.0, fractionDigits: 1 })).toFixed(1));
}

function randomPrice(range: [number, number]): number {
  return faker.number.int({ min: range[0], max: range[1] });
}

function randomRadius(): number {
  return faker.helpers.arrayElement([25, 30, 35, 40, 45, 50]);
}

function saCities(): { city: string; state: string } {
  const cities = [
    'San Antonio', 'San Antonio', 'San Antonio', 'San Antonio', // weight SA
    'Helotes', 'Boerne', 'New Braunfels', 'Schertz', 'Converse', 'Live Oak',
  ];
  return { city: faker.helpers.arrayElement(cities), state: 'TX' };
}

// ─── Main seed function ──────────────────────────────────

async function main() {
  console.log('🌱 Seeding ConnectMe database...\n');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vendorVerification.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('  Cleared existing data');

  // ─── Create vendor users + profiles ────────────────────

  const vendorProfiles: { profileId: string; userId: string; businessName: string }[] = [];

  for (const [category, count] of Object.entries(CATEGORY_COUNTS)) {
    const template = VENDOR_TEMPLATES[category];

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName, provider: 'connectme-demo.com' }).toLowerCase();
      const businessName = template.names[i] ?? `${firstName}'s ${category.replace(/_/g, ' ')}`;
      const rating = randomRating();
      const reviewCount = faker.number.int({ min: 5, max: 120 });
      const bookingCount = faker.number.int({ min: reviewCount, max: reviewCount + 50 });
      const location = saCities();

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: PASSWORD_HASH,
          firstName,
          lastName,
          phone: faker.phone.number({ style: 'national' }),
          profilePhoto: `https://i.pravatar.cc/200?u=${email}`,
          userType: 'VENDOR',
          isVerified: faker.datatype.boolean(0.6), // 60% verified
        },
      });

      const profile = await prisma.vendorProfile.create({
        data: {
          userId: user.id,
          businessName,
          category: category as any,
          bio: template.bioGen(),
          basePrice: randomPrice(template.priceRange),
          priceUnit: template.priceUnit,
          city: location.city,
          state: location.state,
          serviceRadius: randomRadius(),
          coverPhoto: `https://picsum.photos/seed/${category}_${i}_cover/800/600`,
          portfolioPhotos: Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, (_, j) =>
            `https://picsum.photos/seed/${category}_${i}_${j}/800/600`
          ),
          averageRating: rating,
          totalReviews: reviewCount,
          totalBookings: bookingCount,
          subscriptionTier: faker.helpers.weightedArrayElement([
            { value: 'SPARK' as const, weight: 0.5 },
            { value: 'IGNITE' as const, weight: 0.35 },
            { value: 'AMPLIFY' as const, weight: 0.15 },
          ]),
        },
      });

      vendorProfiles.push({ profileId: profile.id, userId: user.id, businessName });
    }
  }

  console.log(`  Created ${vendorProfiles.length} vendor profiles`);

  // ─── Create client users ───────────────────────────────

  const clientUsers: { id: string; firstName: string; lastName: string }[] = [];

  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: 'connectme-demo.com' }).toLowerCase();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: PASSWORD_HASH,
        firstName,
        lastName,
        phone: faker.phone.number({ style: 'national' }),
        profilePhoto: `https://i.pravatar.cc/200?u=${email}`,
        userType: 'CLIENT',
        isVerified: true,
      },
    });

    clientUsers.push({ id: user.id, firstName, lastName });
  }

  console.log(`  Created ${clientUsers.length} client users`);

  // ─── Create bookings + reviews ─────────────────────────

  let bookingCount = 0;
  let reviewCount = 0;

  for (let i = 0; i < 30; i++) {
    const client = faker.helpers.arrayElement(clientUsers);
    const vendor = faker.helpers.arrayElement(vendorProfiles);
    const eventType = faker.helpers.arrayElement(EVENT_TYPES);
    const daysAgo = faker.number.int({ min: 7, max: 180 });
    const eventDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const startHour = faker.number.int({ min: 10, max: 18 });
    const duration = faker.number.int({ min: 2, max: 6 });

    const startTime = new Date(eventDate);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startHour + duration);

    const totalAmount = faker.number.int({ min: 300, max: 5000 });
    const vendorFee = parseFloat((totalAmount * 0.05).toFixed(2));
    const clientFee = parseFloat((totalAmount * 0.05).toFixed(2));
    const platformRevenue = parseFloat((vendorFee + clientFee).toFixed(2));

    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        vendorId: vendor.profileId,
        eventDate,
        eventStartTime: startTime,
        eventEndTime: endTime,
        eventLocation: `${faker.location.streetAddress()}, San Antonio, TX`,
        eventType,
        guestCount: faker.number.int({ min: 20, max: 300 }),
        status: 'COMPLETED',
        totalAmount,
        vendorFee,
        clientFee,
        platformRevenue,
      },
    });

    bookingCount++;

    // Create a payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripePaymentIntentId: `pi_demo_${faker.string.alphanumeric(24)}`,
        amount: totalAmount + clientFee,
        vendorPayout: totalAmount - vendorFee,
        platformFee: platformRevenue,
        status: 'COMPLETED',
      },
    });

    // Create a review for each booking
    const rating = faker.number.int({ min: 3, max: 5 });
    const comments = [
      `${vendor.businessName} was absolutely amazing for our ${eventType.toLowerCase()}! Everyone loved the ${eventType === 'Wedding' ? 'ceremony' : 'party'}.`,
      `Great experience working with ${vendor.businessName}. Very professional and responsive. Would definitely book again for our next San Antonio event.`,
      `Hired ${vendor.businessName} for a ${eventType.toLowerCase()} in ${faker.helpers.arrayElement(SA_NEIGHBORHOODS)} and they exceeded expectations. The guests were blown away!`,
      `${vendor.businessName} made our ${eventType.toLowerCase()} unforgettable. From the initial call to the event day, everything was perfect. Highly recommend to anyone in SA!`,
      `Solid service from ${vendor.businessName}. Showed up on time, professional setup, and the quality was top-notch. Would hire again.`,
      `${vendor.businessName} brought so much energy to our event at ${faker.helpers.arrayElement(SA_VENUES)}. All our guests had an incredible time!`,
    ];

    await prisma.review.create({
      data: {
        bookingId: booking.id,
        clientId: client.id,
        vendorId: vendor.userId,
        rating,
        comment: faker.helpers.arrayElement(comments),
        vendorResponse: faker.datatype.boolean(0.3)
          ? `Thank you so much, ${client.firstName}! It was a pleasure working with you. We love doing events in San Antonio and hope to see you again!`
          : null,
      },
    });

    reviewCount++;
  }

  console.log(`  Created ${bookingCount} completed bookings`);
  console.log(`  Created ${reviewCount} reviews`);

  // ─── Summary ───────────────────────────────────────────

  const totalUsers = await prisma.user.count();
  const totalVendors = await prisma.vendorProfile.count();
  const totalBookings = await prisma.booking.count();
  const totalReviews = await prisma.review.count();

  console.log('\n✅ Seed complete!');
  console.log(`   ${totalUsers} users (${totalVendors} vendors, ${clientUsers.length} clients)`);
  console.log(`   ${totalBookings} bookings, ${totalReviews} reviews`);
  console.log('\n   Demo login: any email + password "demo1234"');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
