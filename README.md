# Sweet Nest - Premium Apartment Booking Platform

A luxury apartment booking website built with Next.js 14, featuring seamless booking, secure payments, and KYC verification.

## 🏡 Project Overview

Sweet Nest is a premium 1 BHK apartment rental platform designed for luxury living. The platform includes:
- User authentication (signup/login)
- Interactive booking calendar
- Secure Cashfree payment integration
- Mandatory KYC/ID verification
- Admin dashboard for management
- Email notifications
- Mobile-responsive luxury UI

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (React, App Router, TypeScript)
- **Backend**: Next.js API Routes
- **Database**: NeonDB (PostgreSQL) with Prisma ORM
- **Authentication**: JWT + NextAuth
- **Payment**: Cashfree Payment Gateway
- **Image Storage**: Cloudinary
- **Styling**: Tailwind CSS
- **Email**: Nodemailer
- **Hosting**: Vercel

## 📋 Features

### User Features
✅ **Landing Page** - Premium hero section with CTAs
✅ **Authentication** - Secure signup/login with password hashing
✅ **Booking Calendar** - Interactive date selection with price calculation
✅ **Terms & Conditions** - Mandatory agreement before payment
✅ **Payment Integration** - Cashfree gateway for secure transactions
✅ **KYC Verification** - Upload Aadhaar, PAN, Passport, Driving License
✅ **Booking Confirmation** - Email and dashboard confirmation
✅ **Dashboard** - View all bookings and manage account

### Admin Features
✅ **Admin Login** - Secure admin access
✅ **Booking Management** - View and manage all bookings
✅ **KYC Verification** - Approve/reject ID documents
✅ **Payment Tracking** - Monitor all transactions
✅ **User Management** - View all users
✅ **Calendar Management** - Block/unblock dates
✅ **Email Support** - Send emails to users

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (NeonDB)
- Cashfree account
- Cloudinary account (optional)

### Installation

1. **Dependencies already installed** ✅

2. **Set up environment variables**
```bash
# Edit .env.local with your credentials:
# - DATABASE_URL: NeonDB PostgreSQL connection
# - NEXTAUTH_SECRET & JWT_SECRET: Generate 32+ char random strings
# - Cashfree API credentials
# - Email service credentials
# - Cloudinary credentials (optional)
```

3. **Initialize Prisma**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
sweetnest/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (user)/              # User pages
│   │   │   ├── dashboard/
│   │   │   ├── booking/
│   │   │   ├── terms/
│   │   │   ├── payment/
│   │   │   ├── kyc/
│   │   │   └── confirmation/
│   │   ├── admin/               # Admin panel
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   ├── payment/
│   │   │   ├── kyc/
│   │   │   └── admin/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── lib/                     # Utilities
│   │   ├── password.ts          # bcrypt utilities
│   │   ├── jwt.ts               # JWT utilities
│   │   ├── email.ts             # Email templates
│   │   └── prisma.ts            # DB client
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma            # Database schema
├── .env.local
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🔐 Security Features

- ✅ **Password Hashing**: bcryptjs with salt rounds
- ✅ **JWT Authentication**: Secure token generation and validation
- ✅ **Input Validation**: Type-safe with TypeScript & Zod
- ✅ **HTTPS**: Required in production
- ✅ **Data Encryption**: ID documents stored securely
- ✅ **Environment Variables**: Sensitive data in .env.local
- ✅ **CORS**: Protected API routes

## 💾 Database Schema

### Users
- id (UUID), name, email, password, phone, role (USER/ADMIN), timestamps

### Bookings
- id, userId, checkInDate, checkOutDate, numberOfGuests, totalPrice
- status, paymentStatus, kycStatus, notes, timestamps

### Payments
- id, bookingId, amount, currency, status, transactionId, orderId, timestamps

### KYC
- id, userId, bookingId, document URLs, verification status, verifiedBy, timestamps

### Calendar
- date, available, price, blockedReason, timestamps

### SupportTicket
- id, userId, subject, message, status, adminReply, timestamps

## 🎨 Design System

### Colors
- **Primary**: #d4af37 (Gold)
- **Dark**: #0a0a0a (Black)
- **Secondary**: #1a1a1a, #2a2a2a (Dark grays)
- **Text**: #e0e0e0 (Light gray)

### Typography
- **Heading**: Playfair Display (serif)
- **Body**: Poppins (sans-serif)

### Features
- Luxury card design with gold borders
- Smooth fade/slide animations
- Mobile-first responsive design
- Dark theme with accent lighting

## 📧 Email Templates

- ✅ Signup welcome email
- ✅ Booking confirmation email
- ✅ Payment success email
- ✅ KYC approval email

## 🚨 Before Deployment

1. **Database Setup**:
   - Create NeonDB PostgreSQL instance
   - Update DATABASE_URL in .env.local
   - Run: `npx prisma migrate deploy`

2. **Cashfree Integration**:
   - Get API credentials from Cashfree dashboard
   - Update CASHFREE_* variables
   - Test in sandbox mode first

3. **Email Configuration**:
   - Use Gmail App Password or SendGrid
   - Update EMAIL_* variables

4. **Security**:
   - Generate strong NEXTAUTH_SECRET and JWT_SECRET (32+ chars)
   - Enable HTTPS in production
   - Set NODE_ENV=production

5. **Deployment**:
   - Connect repo to Vercel
   - Add environment variables
   - Deploy!

## 📱 Mobile Responsive

- Fully responsive design
- Mobile-first approach
- Touch-friendly UI
- Optimized for all screen sizes

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Cashfree API](https://docs.cashfree.com/)

## ✨ Next Steps

1. Set up NeonDB PostgreSQL database
2. Configure Cashfree payment gateway
3. Set up Cloudinary for image storage
4. Configure email service (Gmail/SendGrid)
5. Run database migrations: `npx prisma migrate dev`
6. Test complete booking flow
7. Deploy to Vercel

---

Built with ❤️ for premium apartment bookings
