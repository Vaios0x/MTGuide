import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { sendBookingConfirmationEmail } from '../services/email';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// Esquemas de validación
const createBookingSchema = z.object({
  experienceId: z.string(),
  experienceDateId: z.string(),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(10),
  attendees: z.number().min(1).max(12),
  notes: z.string().optional(),
});

// POST /api/bookings - Crear nueva reserva
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const bookingData = createBookingSchema.parse(req.body);

    // Verificar que la experiencia existe
    const experience = await prisma.experience.findUnique({
      where: { id: bookingData.experienceId },
    });

    if (!experience) {
      return res.status(404).json({ error: 'Experiencia no encontrada' });
    }

    // Verificar que la fecha existe y está disponible
    const experienceDate = await prisma.experienceDate.findUnique({
      where: { id: bookingData.experienceDateId },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
      },
    });

    if (!experienceDate) {
      return res.status(404).json({ error: 'Fecha no encontrada' });
    }

    if (!experienceDate.isActive) {
      return res.status(400).json({ error: 'Fecha no disponible' });
    }

    // Verificar disponibilidad
    const currentBookings = experienceDate._count.bookings;
    const availableSpots = experienceDate.maxAttendees - currentBookings;

    if (availableSpots < bookingData.attendees) {
      return res.status(400).json({ 
        error: 'No hay suficientes lugares disponibles',
        availableSpots 
      });
    }

    // Calcular precio total
    const pricePerPerson = experienceDate.price || experience.price;
    const totalAmount = pricePerPerson * bookingData.attendees;

    // Crear la reserva
    const booking = await prisma.booking.create({
      data: {
        ...bookingData,
        totalAmount,
        status: 'PENDING',
      },
      include: {
        experience: true,
        experienceDate: true,
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/bookings/:id - Obtener reserva por ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        experience: true,
        experienceDate: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/bookings/:id/confirm - Confirmar reserva (después del pago)
router.put('/:id/confirm', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stripePaymentId, paidAmount } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        stripePaymentId,
        paidAmount,
      },
      include: {
        experience: true,
        experienceDate: true,
      },
    });

    // Enviar email de confirmación
    try {
      await sendBookingConfirmationEmail(booking);
    } catch (emailError) {
      console.error('Error al enviar email de confirmación:', emailError);
      // No fallar la confirmación si el email falla
    }

    res.json(booking);
  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/bookings/:id/cancel - Cancelar reserva
router.put('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        experience: true,
        experienceDate: true,
      },
    });

    res.json(booking);
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/bookings - Obtener reservas (para admin)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, experienceId, limit = '50', offset = '0' } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(experienceId && { experienceId: experienceId as string }),
      },
      include: {
        experience: {
          select: {
            title: true,
            slug: true,
          },
        },
        experienceDate: {
          select: {
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.booking.count({
      where: {
        ...(status && { status: status as any }),
        ...(experienceId && { experienceId: experienceId as string }),
      },
    });

    res.json({
      bookings,
      total,
      hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 