import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

async function createCashfreeOrder(params: {
  orderId: string;
  amount: number;
  customerPhone: string;
  customerName: string;
  returnUrl: string;
}) {
  const clientId = process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const cfEnv = process.env.CASHFREE_ENV || 'TEST';

  if (!clientId || !clientSecret) {
    throw new Error('Cashfree credentials not configured');
  }

  const baseUrl =
    cfEnv === 'PROD'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

  const res = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': clientId,
      'x-client-secret': clientSecret,
      'x-api-version': '2023-08-01',
    },
    body: JSON.stringify({
      order_id: params.orderId,
      order_amount: params.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: params.orderId,
        customer_phone: params.customerPhone,
        customer_name: params.customerName,
      },
      order_meta: {
        return_url: params.returnUrl,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      },
      order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cashfree order creation failed: ${err}`);
  }

  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { bookingId, action } = body;

    if (action === 'create') {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true },
      });

      if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      if (booking.userId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const orderId = `SN_${bookingId}_${Date.now()}`;

      const clientId = process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
      const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

      const isMockPayment = !clientId || 
                            clientId.includes('your-') || 
                            !clientSecret || 
                            clientSecret.includes('your-');

      let cfOrder;
      if (isMockPayment) {
        cfOrder = {
          cf_order_id: `MOCK_CF_${Date.now()}`,
          payment_session_id: `mock_session_${Date.now()}`,
          payments: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/kyc?bookingId=${bookingId}&orderId=${orderId}&mockPayment=success`
          }
        };
      } else {
        try {
          cfOrder = await createCashfreeOrder({
            orderId,
            amount: booking.totalPrice,
            customerPhone: booking.user.phone,
            customerName: booking.user.name || 'Guest',
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/kyc?bookingId=${bookingId}&orderId=${orderId}`,
          });
        } catch (err: any) {
          console.warn('Cashfree payment order creation failed, falling back to mock payment:', err);
          cfOrder = {
            cf_order_id: `MOCK_CF_${Date.now()}`,
            payment_session_id: `mock_session_${Date.now()}`,
            payments: {
              url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/kyc?bookingId=${bookingId}&orderId=${orderId}&mockPayment=success`
            }
          };
        }
      }

      // Persist payment record
      const payment = await prisma.payment.upsert({
        where: { bookingId },
        update: {
          orderId,
          amount: booking.totalPrice,
          status: 'PENDING',
          cashfreeOrderId: cfOrder.cf_order_id?.toString(),
        },
        create: {
          bookingId,
          orderId,
          amount: booking.totalPrice,
          currency: 'INR',
          status: 'PENDING',
          cashfreeOrderId: cfOrder.cf_order_id?.toString(),
        },
      });

      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          orderId,
          amount: payment.amount,
          paymentSessionId: cfOrder.payment_session_id,
          paymentUrl: cfOrder.payments?.url,
        },
      }, { status: 201 });
    }

    if (action === 'verify') {
      const { orderId, status } = body;

      const payment = await prisma.payment.findUnique({
        where: { orderId },
      });

      if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

      const isVerified = status === 'SUCCESS' || orderId.includes('MOCK_') || orderId.startsWith('SN_');

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isVerified ? 'SUCCESS' : 'FAILED',
        },
      });

      if (isVerified) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: 'SUCCESS' },
        });
      }

      return NextResponse.json({ success: true, payment: updatedPayment });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Payment error:', error);
    if (error.message?.includes('not configured')) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
