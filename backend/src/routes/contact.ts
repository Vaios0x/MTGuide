import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { sendContactFormEmail } from '../services/email';
import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// Esquemas de validación
const contactFormSchema = z.object({
  type: z.enum(['GENERAL', 'CUSTOM_GUIDE']),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
  // Campos específicos para guía personalizado
  dateRange: z.string().optional(),
  mountainType: z.string().optional(),
  experience: z.string().optional(),
  budget: z.string().optional(),
});

// POST /api/contact - Enviar formulario de contacto
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const contactData = contactFormSchema.parse(req.body);

    // Guardar en base de datos
    const contact = await prisma.contactForm.create({
      data: contactData,
    });

    // Enviar email
    try {
      await sendContactFormEmail(contactData);
    } catch (emailError) {
      console.error('Error al enviar email de contacto:', emailError);
      // No fallar el guardado si el email falla
    }

    res.status(201).json({ 
      message: 'Formulario enviado exitosamente',
      id: contact.id 
    });
  } catch (error) {
    console.error('Error al procesar formulario de contacto:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/contact - Obtener formularios de contacto (para admin)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, isRead, limit = '50', offset = '0' } = req.query;

    const contacts = await prisma.contactForm.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(isRead !== undefined && { isRead: isRead === 'true' }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.contactForm.count({
      where: {
        ...(type && { type: type as any }),
        ...(isRead !== undefined && { isRead: isRead === 'true' }),
      },
    });

    res.json({
      contacts,
      total,
      hasMore: parseInt(offset as string) + parseInt(limit as string) < total,
    });
  } catch (error) {
    console.error('Error al obtener formularios de contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/contact/:id/read - Marcar formulario como leído
router.put('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contactForm.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(contact);
  } catch (error) {
    console.error('Error al marcar formulario como leído:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 