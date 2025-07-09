import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Esquemas de validación
const createPaymentIntentSchema = z.object({
  bookingId: z.string(),
  amount: z.number().positive(),
});

// POST /api/payments/create-intent - Crear payment intent
router.post('/create-intent', async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, amount } = createPaymentIntentSchema.parse(req.body);

    // Verificar que la reserva existe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        experience: true,
        experienceDate: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'La reserva no está pendiente de pago' });
    }

    // Crear payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'mxn',
      metadata: {
        bookingId: booking.id,
        experienceTitle: booking.experience.title,
        clientEmail: booking.clientEmail,
      },
      description: `Anticipo para ${booking.experience.title} - ${booking.clientName}`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error al crear payment intent:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/payments/webhook - Webhook de Stripe
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Error al verificar webhook:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.bookingId;

        if (bookingId) {
          // Actualizar reserva a confirmada
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: 'CONFIRMED',
              stripePaymentId: paymentIntent.id,
              paidAmount: paymentIntent.amount / 100, // Convertir de centavos
            },
          });

          console.log(`Reserva ${bookingId} confirmada con pago ${paymentIntent.id}`);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        const failedBookingId = failedPayment.metadata.bookingId;

        if (failedBookingId) {
          console.log(`Pago falló para reserva ${failedBookingId}`);
          // Aquí podrías enviar un email al cliente notificando el fallo
        }
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error al procesar webhook:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/payments/status/:paymentIntentId - Verificar estado del pago
router.get('/status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      bookingId: paymentIntent.metadata.bookingId,
    });
  } catch (error) {
    console.error('Error al verificar estado del pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/payments/refund - Crear reembolso
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Reembolso parcial o total
      reason: reason || 'requested_by_customer',
    });

    res.json({
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    });
  } catch (error) {
    console.error('Error al crear reembolso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 