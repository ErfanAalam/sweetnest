const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

type Color = number;
const COLORS: Record<string, Color> = {
  green:  0x22c55e,
  amber:  0xb45309,
  blue:   0x3b82f6,
  red:    0xef4444,
};

interface EmbedField { name: string; value: string; inline?: boolean; }
interface EmbedImage  { url: string; }

interface Embed {
  title:       string;
  description: string;
  color:       Color;
  fields?:     EmbedField[];
  image?:      EmbedImage;
  thumbnail?:  EmbedImage;
  footer?:     { text: string };
  timestamp?:  string;
}

async function sendEmbed(embeds: Embed[]): Promise<void> {
  if (!WEBHOOK_URL) {
    console.warn('[Discord] DISCORD_WEBHOOK_URL not set — notification skipped');
    return;
  }
  try {
    await fetch(WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ embeds }),
    });
  } catch (err) {
    console.error('[Discord] Failed to send webhook:', err);
  }
}

// ─── Booking confirmed (payment success) ────────────────────────────────────
export async function notifyBookingConfirmed(booking: {
  id:             string;
  checkInDate:    Date;
  checkOutDate:   Date;
  numberOfGuests: number;
  totalPrice:     number;
  user: { name: string | null; phone: string };
}) {
  const nights = Math.round(
    (booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / 86400000
  );

  await sendEmbed([{
    title:       '✅ New Booking Confirmed — Sweet Nest',
    description: `**${booking.user.name ?? 'Guest'}** just completed payment and their booking is confirmed.`,
    color:       COLORS.green,
    fields: [
      { name: '👤 Guest',       value: booking.user.name ?? '—',                                         inline: true  },
      { name: '📱 Phone',       value: `+91 ${booking.user.phone}`,                                      inline: true  },
      { name: '📅 Check-in',   value: booking.checkInDate.toLocaleDateString('en-IN',  { dateStyle: 'medium' }), inline: true },
      { name: '📅 Check-out',  value: booking.checkOutDate.toLocaleDateString('en-IN', { dateStyle: 'medium' }), inline: true },
      { name: '🌙 Nights',     value: String(nights),                                                    inline: true  },
      { name: '👥 Guests',     value: String(booking.numberOfGuests),                                    inline: true  },
      { name: '💰 Amount Paid',value: `₹${booking.totalPrice.toLocaleString('en-IN')}`,                  inline: true  },
      { name: '🔖 Booking ID', value: `\`${booking.id}\``,                                               inline: false },
    ],
    footer:    { text: 'Sweet Nest · Booking System' },
    timestamp: new Date().toISOString(),
  }]);
}

// ─── KYC submitted ──────────────────────────────────────────────────────────
export async function notifyKYCSubmitted(data: {
  userId:           string;
  userName:         string | null;
  userPhone:        string;
  bookingId?:       string | null;
  aadharUrl?:       string | null;
  panUrl?:          string | null;
  passportUrl?:     string | null;
  drivingLicenseUrl?: string | null;
}) {
  const docs: EmbedField[] = [
    { name: 'Aadhaar Card',    value: data.aadharUrl          ? '✅ Uploaded' : '❌ Not provided', inline: true },
    { name: 'PAN Card',        value: data.panUrl             ? '✅ Uploaded' : '❌ Not provided', inline: true },
    { name: 'Passport',        value: data.passportUrl        ? '✅ Uploaded' : '— Not provided',  inline: true },
    { name: 'Driving Licence', value: data.drivingLicenseUrl  ? '✅ Uploaded' : '— Not provided',  inline: true },
  ];

  // Collect image embeds — one embed per image (Discord shows one image per embed)
  const imageUrls = [
    data.aadharUrl,
    data.panUrl,
    data.passportUrl,
    data.drivingLicenseUrl,
  ].filter((u): u is string => !!u);

  const imageLabels = ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving Licence'];
  const docIndexes  = [
    data.aadharUrl          ? 0 : -1,
    data.panUrl             ? 1 : -1,
    data.passportUrl        ? 2 : -1,
    data.drivingLicenseUrl  ? 3 : -1,
  ].filter(i => i >= 0);

  // Main summary embed
  const mainEmbed: Embed = {
    title:       '📋 KYC Documents Submitted — Sweet Nest',
    description: `**${data.userName ?? 'Guest'}** has submitted identity documents for verification.`,
    color:       COLORS.blue,
    fields: [
      { name: '👤 Guest',      value: data.userName ?? '—',          inline: true  },
      { name: '📱 Phone',      value: `+91 ${data.userPhone}`,       inline: true  },
      { name: '🔖 Booking ID', value: data.bookingId ? `\`${data.bookingId}\`` : 'Direct submission (no booking)', inline: false },
      ...docs,
    ],
    footer:    { text: 'Sweet Nest · KYC Verification Queue' },
    timestamp: new Date().toISOString(),
  };

  // Additional embeds for each uploaded image (max 10 embeds per webhook call)
  const imageEmbeds: Embed[] = imageUrls.map((url, i) => ({
    title:       `📎 Document ${i + 1}: ${imageLabels[docIndexes[i]] ?? 'Document'}`,
    description: `Submitted by **${data.userName ?? 'Guest'}** (+91 ${data.userPhone})`,
    color:       COLORS.amber,
    image:       { url },
    footer:      { text: `Sweet Nest · Document ${i + 1} of ${imageUrls.length}` },
  }));

  await sendEmbed([mainEmbed, ...imageEmbeds]);
}
