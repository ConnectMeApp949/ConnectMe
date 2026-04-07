const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@send.connectmeapp.services';

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('[Mail] No RESEND_API_KEY set, skipping email to:', to);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ConnectMe <' + FROM_EMAIL + '>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Mail] Failed to send email:', error);
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = (process.env.APP_URL || 'https://connectmeapp.services') + '/reset-password?token=' + resetToken;

  await sendEmail(email, 'Reset Your Password', '\
    <div style="font-family: Poppins, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">\
      <h1 style="color: #AA8330; font-size: 24px; margin-bottom: 8px;">ConnectMe</h1>\
      <h2 style="color: #151515; font-size: 20px;">Reset Your Password</h2>\
      <p style="color: #575757; line-height: 1.6;">You requested a password reset. Click the button below to set a new password:</p>\
      <a href="' + resetUrl + '" style="display: inline-block; background: #AA8330; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 20px 0;">Reset Password</a>\
      <p style="color: #9CA3AF; font-size: 14px;">This link expires in 1 hour. If you didn\'t request this, ignore this email.</p>\
      <hr style="border: none; border-top: 1px solid #E8E2D9; margin: 30px 0;">\
      <p style="color: #9CA3AF; font-size: 12px;">ConnectMe Inc. · San Antonio, TX</p>\
    </div>\
  ');
}

export async function sendBookingConfirmationEmail(email: string, vendorName: string, eventDate: string, confirmationCode: string): Promise<void> {
  await sendEmail(email, 'Booking Confirmed - ' + vendorName, '\
    <div style="font-family: Poppins, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">\
      <h1 style="color: #AA8330; font-size: 24px; margin-bottom: 8px;">ConnectMe</h1>\
      <h2 style="color: #151515; font-size: 20px;">Booking Confirmed!</h2>\
      <p style="color: #575757; line-height: 1.6;">Your booking with <strong>' + vendorName + '</strong> has been confirmed.</p>\
      <div style="background: #FEF2E4; border-radius: 12px; padding: 20px; margin: 20px 0;">\
        <p style="color: #151515; margin: 0;"><strong>Vendor:</strong> ' + vendorName + '</p>\
        <p style="color: #151515; margin: 8px 0 0;"><strong>Date:</strong> ' + eventDate + '</p>\
        <p style="color: #151515; margin: 8px 0 0;"><strong>Confirmation:</strong> ' + confirmationCode + '</p>\
      </div>\
      <p style="color: #575757; line-height: 1.6;">You can view your booking details in the ConnectMe app.</p>\
      <hr style="border: none; border-top: 1px solid #E8E2D9; margin: 30px 0;">\
      <p style="color: #9CA3AF; font-size: 12px;">ConnectMe Inc. · San Antonio, TX</p>\
    </div>\
  ');
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  await sendEmail(email, 'Welcome to ConnectMe!', '\
    <div style="font-family: Poppins, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">\
      <h1 style="color: #AA8330; font-size: 24px; margin-bottom: 8px;">ConnectMe</h1>\
      <h2 style="color: #151515; font-size: 20px;">Welcome, ' + firstName + '!</h2>\
      <p style="color: #575757; line-height: 1.6;">Thanks for joining ConnectMe — the premier marketplace for event vendors in San Antonio.</p>\
      <p style="color: #575757; line-height: 1.6;">Here\'s what you can do:</p>\
      <ul style="color: #575757; line-height: 2;">\
        <li>Browse and book amazing event vendors</li>\
        <li>Compare prices and read reviews</li>\
        <li>Message vendors directly</li>\
        <li>Plan your events with our event planner</li>\
      </ul>\
      <a href="https://connectmeapp.services" style="display: inline-block; background: #AA8330; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 20px 0;">Open ConnectMe</a>\
      <hr style="border: none; border-top: 1px solid #E8E2D9; margin: 30px 0;">\
      <p style="color: #9CA3AF; font-size: 12px;">ConnectMe Inc. · San Antonio, TX</p>\
    </div>\
  ');
}
