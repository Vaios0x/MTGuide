import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { AuthRequest } from '../types/auth';
import { Response } from 'express';

const router = Router();

// Esquemas de validación
const postQuerySchema = z.object({
  category: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
  published: z.string().transform(val => val === 'true').optional(),
});

// GET /api/blog/posts - Obtener posts del blog
router.get('/posts', async (req: AuthRequest, res: Response) => {
  try {
    const query = postQuerySchema.parse(req.query);
    
    const posts = await prisma.post.findMany({
      where: {
        ...(query.published !== undefined && { isPublished: query.published }),
        ...(query.category && { 
          category: {
            slug: query.category
          }
        }),
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: query.limit || 20,
      skip: query.offset || 0,
    });

    const total = await prisma.post.count({
      where: {
        ...(query.published !== undefined && { isPublished: query.published }),
        ...(query.category && { 
          category: {
            slug: query.category
          }
        }),
      },
    });

    res.json({
      posts,
      total,
      hasMore: (query.offset || 0) + (query.limit || 20) < total,
    });
  } catch (error) {
    console.error('Error al obtener posts:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/blog/posts/:slug - Obtener post por slug
router.get('/posts/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // Solo mostrar posts publicados en el frontend
    if (!post.isPublished) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error al obtener post:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/blog/categories - Obtener categorías
router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/blog/featured - Obtener posts destacados
router.get('/featured', async (req: AuthRequest, res: Response) => {
  try {
    const featuredPosts = await prisma.post.findMany({
      where: {
        isPublished: true,
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    res.json(featuredPosts);
  } catch (error) {
    console.error('Error al obtener posts destacados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 