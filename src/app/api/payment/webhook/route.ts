import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { notifyBookingConfirmed } from '@/lib/discord';

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.CASHFREE_CLIENT_SECRET || '';
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
  return expectedSig === signature;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';
    const timestamp = request.headers.get('x-webhook-timestamp') || '';

    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      const signedPayload = `${timestamp}${rawBody}`;
      if (!verifyWebhookSignature(signedPayload, signature)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const { type, data } = event;

    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { order, payment } = data;
      const orderId = order.order_id;

      // Find payment record by orderId
      const paymentRecord = await prisma.payment.findUnique({
        where: { orderId },
        include: { booking: { include: { user: true } } },
      });

      if (!paymentRecord) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Update payment
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: 'SUCCESS',
          transactionId: payment.cf_payment_id?.toString(),
          cashfreeOrderId: order.cf_order_id?.toString(),
          paymentMethod: payment.payment_method,
        },
      });

      // Update booking payment status
      const confirmedBooking = await prisma.booking.update({
        where: { id: paymentRecord.bookingId },
        data: { paymentStatus: 'SUCCESS' },
        include: { user: true },
      });

      // Discord notification — fire-and-forget, don't block the response
      notifyBookingConfirmed({
        id:             confirmedBooking.id,
        checkInDate:    confirmedBooking.checkInDate,
        checkOutDate:   confirmedBooking.checkOutDate,
        numberOfGuests: confirmedBooking.numberOfGuests,
        totalPrice:     confirmedBooking.totalPrice,
        user: {
          name:  confirmedBooking.user.name,
          phone: confirmedBooking.user.phone,
        },
      }).catch(console.error);

      return NextResponse.json({ success: true });
    }

    if (type === 'PAYMENT_FAILED_WEBHOOK') {
      const { order, payment } = data;
      const orderId = order.order_id;

      const paymentRecord = await prisma.payment.findUnique({
        where: { orderId },
      });

      if (paymentRecord) {
        await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: {
            status: 'FAILED',
            failureReason: payment.payment_message || 'Payment failed',
          },
        });

        await prisma.booking.update({
          where: { id: paymentRecord.bookingId },
          data: { paymentStatus: 'FAILED' },
        });
      }

      return NextResponse.json({ success: true });
    }

    // Acknowledge unknown events
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
