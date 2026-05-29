import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Sweet Nest <noreply@sweetne.st>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export function getSignupEmailTemplate(name: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Poppins', sans-serif; background-color: #0a0a0a; color: #e0e0e0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 40px; border-radius: 8px; border: 1px solid #d4af37; }
        .header { text-align: center; margin-bottom: 30px; font-family: 'Playfair Display', serif; font-size: 28px; color: #d4af37; }
        .content { line-height: 1.6; }
        .button { display: inline-block; background-color: #d4af37; color: #0a0a0a; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">🏡 Welcome to Sweet Nest</div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>Thank you for signing up to Sweet Nest! We're thrilled to have you join our premium apartment rental community.</p>
          <p>Your account has been successfully created. You can now browse and book our exclusive 1 BHK apartments.</p>
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Login to Your Account</a>
          </div>
          <p style="margin-top: 20px;">If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Sweet Nest. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getBookingConfirmationTemplate(
  name: string,
  bookingId: string,
  checkIn: string,
  checkOut: string,
  amount: number
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Poppins', sans-serif; background-color: #0a0a0a; color: #e0e0e0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 40px; border-radius: 8px; border: 1px solid #d4af37; }
        .header { text-align: center; margin-bottom: 30px; font-family: 'Playfair Display', serif; font-size: 28px; color: #d4af37; }
        .booking-details { background-color: #0a0a0a; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #333; }
        .detail-label { color: #d4af37; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">✅ Booking Confirmed</div>
        <div style="padding: 20px;">
          <p>Hello ${name},</p>
          <p>Your booking has been confirmed! Here are your booking details:</p>
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span>${bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-in:</span>
              <span>${checkIn}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Check-out:</span>
              <span>${checkOut}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span>₹${amount.toFixed(2)}</span>
            </div>
          </div>
          <p>You will receive further instructions soon. If you have any queries, contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Sweet Nest. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getKYCApprovalTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Poppins', sans-serif; background-color: #0a0a0a; color: #e0e0e0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 40px; border-radius: 8px; border: 1px solid #d4af37; }
        .header { text-align: center; margin-bottom: 30px; font-family: 'Playfair Display', serif; font-size: 28px; color: #d4af37; }
        .button { display: inline-block; background-color: #d4af37; color: #0a0a0a; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">✅ KYC Verified Successfully</div>
        <div style="padding: 20px;">
          <p>Hello ${name},</p>
          <p>Great news! Your KYC verification has been approved. Your account is now fully verified and you can proceed with your booking.</p>
          <p>You can now access all features of Sweet Nest premium booking platform.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `;
}
