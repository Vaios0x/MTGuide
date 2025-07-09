import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { ExperienceType, Difficulty } from '@prisma/client';

const router = Router();

// Esquemas de validación
const experienceQuerySchema = z.object({
  category: z.nativeEnum(ExperienceType).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

// GET /api/experiences - Obtener todas las experiencias
router.get('/', async (req, res) => {
  try {
    const query = experienceQuerySchema.parse(req.query);
    
    const experiences = await prisma.experience.findMany({
      where: {
        isActive: true,
        ...(query.category && { category: query.category }),
        ...(query.difficulty && { difficulty: query.difficulty }),
      },
      include: {
        dates: {
          where: {
            isActive: true,
            startDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            startDate: 'asc',
          },
        },
        _count: {
          select: {
            testimonials: {
              where: { isActive: true },
            },
          },
        },
      },
      take: query.limit || 50,
      skip: query.offset || 0,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(experiences);
  } catch (error) {
    console.error('Error al obtener experiencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/experiences/:slug - Obtener experiencia por slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const experience = await prisma.experience.findUnique({
      where: { slug },
      include: {
        dates: {
          where: {
            isActive: true,
            startDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            startDate: 'asc',
          },
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
        },
        testimonials: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!experience) {
      return res.status(404).json({ error: 'Experiencia no encontrada' });
    }

    // Agregar disponibilidad a cada fecha
    const experienceWithAvailability = {
      ...experience,
      dates: experience.dates.map(date => ({
        ...date,
        availableSpots: date.maxAttendees - date._count.bookings,
        isAvailable: date.maxAttendees > date._count.bookings,
      })),
    };

    res.json(experienceWithAvailability);
  } catch (error) {
    console.error('Error al obtener experiencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/experiences/category/:category - Obtener experiencias por categoría
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validar categoría
    if (!Object.values(ExperienceType).includes(category as ExperienceType)) {
      return res.status(400).json({ error: 'Categoría inválida' });
    }

    const experiences = await prisma.experience.findMany({
      where: {
        category: category as ExperienceType,
        isActive: true,
      },
      include: {
        dates: {
          where: {
            isActive: true,
            startDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            startDate: 'asc',
          },
          take: 3, // Solo las próximas 3 fechas
        },
        _count: {
          select: {
            testimonials: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(experiences);
  } catch (error) {
    console.error('Error al obtener experiencias por categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 