import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authMiddleware);
router.use(adminMiddleware);

// Esquemas de validación
const experienceSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(['INICIACION', 'FORMACION', 'EXPEDICION']),
  difficulty: z.enum(['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'EXPERTO']),
  duration: z.string().min(1),
  price: z.number().positive(),
  includes: z.array(z.string()),
  excludes: z.array(z.string()),
  images: z.array(z.string()),
  videoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

const experienceDateSchema = z.object({
  experienceId: z.string(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  maxAttendees: z.number().positive(),
  price: z.number().positive().optional(),
  isActive: z.boolean().default(true),
});

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().min(1),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  isPublished: z.boolean().default(false),
});

const testimonialSchema = z.object({
  experienceId: z.string().optional(),
  name: z.string().min(1),
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

// === EXPERIENCIAS ===

// GET /api/admin/experiences - Obtener todas las experiencias
router.get('/experiences', async (req: AuthRequest, res: Response) => {
  try {
    const experiences = await prisma.experience.findMany({
      include: {
        dates: {
          orderBy: { startDate: 'asc' },
        },
        _count: {
          select: {
            bookings: true,
            testimonials: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(experiences);
  } catch (error) {
    console.error('Error al obtener experiencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/experiences - Crear experiencia
router.post('/experiences', async (req: AuthRequest, res: Response) => {
  try {
    const experienceData = experienceSchema.parse(req.body);
    
    const experience = await prisma.experience.create({
      data: experienceData,
    });

    res.status(201).json(experience);
  } catch (error) {
    console.error('Error al crear experiencia:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/experiences/:id - Actualizar experiencia
router.put('/experiences/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const experienceData = experienceSchema.parse(req.body);

    const experience = await prisma.experience.update({
      where: { id },
      data: experienceData,
    });

    res.json(experience);
  } catch (error) {
    console.error('Error al actualizar experiencia:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/experiences/:id - Eliminar experiencia
router.delete('/experiences/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.experience.delete({
      where: { id },
    });

    res.json({ message: 'Experiencia eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar experiencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === FECHAS DE EXPERIENCIAS ===

// POST /api/admin/experience-dates - Crear fecha de experiencia
router.post('/experience-dates', async (req: AuthRequest, res: Response) => {
  try {
    const dateData = experienceDateSchema.parse(req.body);
    
    const experienceDate = await prisma.experienceDate.create({
      data: dateData,
    });

    res.status(201).json(experienceDate);
  } catch (error) {
    console.error('Error al crear fecha de experiencia:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/experience-dates/:id - Actualizar fecha de experiencia
router.put('/experience-dates/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const dateData = experienceDateSchema.partial().parse(req.body);

    const experienceDate = await prisma.experienceDate.update({
      where: { id },
      data: dateData,
    });

    res.json(experienceDate);
  } catch (error) {
    console.error('Error al actualizar fecha de experiencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/experience-dates/:id - Eliminar fecha de experiencia
router.delete('/experience-dates/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.experienceDate.delete({
      where: { id },
    });

    res.json({ message: 'Fecha eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar fecha de experiencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === POSTS DEL BLOG ===

// GET /api/admin/posts - Obtener todos los posts
router.get('/posts', async (req: AuthRequest, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(posts);
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/posts - Crear post
router.post('/posts', async (req: AuthRequest, res: Response) => {
  try {
    const postData = postSchema.parse(req.body);
    
    const post = await prisma.post.create({
      data: postData,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error al crear post:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/posts/:id - Actualizar post
router.put('/posts/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const postData = postSchema.parse(req.body);

    const post = await prisma.post.update({
      where: { id },
      data: postData,
    });

    res.json(post);
  } catch (error) {
    console.error('Error al actualizar post:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/posts/:id - Eliminar post
router.delete('/posts/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.post.delete({
      where: { id },
    });

    res.json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === TESTIMONIOS ===

// GET /api/admin/testimonials - Obtener todos los testimonios
router.get('/testimonials', async (req: AuthRequest, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      include: {
        experience: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(testimonials);
  } catch (error) {
    console.error('Error al obtener testimonios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/admin/testimonials - Crear testimonio
router.post('/testimonials', async (req: AuthRequest, res: Response) => {
  try {
    const testimonialData = testimonialSchema.parse(req.body);
    
    const testimonial = await prisma.testimonial.create({
      data: testimonialData,
    });

    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Error al crear testimonio:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/admin/testimonials/:id - Actualizar testimonio
router.put('/testimonials/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const testimonialData = testimonialSchema.parse(req.body);

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: testimonialData,
    });

    res.json(testimonial);
  } catch (error) {
    console.error('Error al actualizar testimonio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/admin/testimonials/:id - Eliminar testimonio
router.delete('/testimonials/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.testimonial.delete({
      where: { id },
    });

    res.json({ message: 'Testimonio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar testimonio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === DASHBOARD ===

// GET /api/admin/dashboard - Obtener estadísticas del dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalExperiences,
      totalBookings,
      totalRevenue,
      pendingBookings,
      recentBookings,
      popularExperiences,
    ] = await Promise.all([
      prisma.experience.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { paidAmount: true },
      }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          experience: { select: { title: true } },
          experienceDate: { select: { startDate: true } },
        },
      }),
      prisma.experience.findMany({
        take: 5,
        include: {
          _count: { select: { bookings: true } },
        },
        orderBy: {
          bookings: { _count: 'desc' },
        },
      }),
    ]);

    res.json({
      totalExperiences,
      totalBookings,
      totalRevenue: totalRevenue._sum.paidAmount || 0,
      pendingBookings,
      recentBookings,
      popularExperiences,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 