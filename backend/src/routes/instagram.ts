import { Router } from 'express';
import { getInstagramPosts, syncInstagramPosts } from '../services/instagram';

const router = Router();

// GET /api/instagram/posts - Obtener posts de Instagram
router.get('/posts', async (req, res) => {
  try {
    const { limit = '20' } = req.query;
    const posts = await getInstagramPosts(parseInt(limit as string));
    res.json(posts);
  } catch (error) {
    console.error('Error al obtener posts de Instagram:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/instagram/sync - Sincronizar posts manualmente
router.post('/sync', async (req, res) => {
  try {
    const syncedCount = await syncInstagramPosts();
    res.json({ 
      message: 'Sincronización completada',
      syncedPosts: syncedCount 
    });
  } catch (error) {
    console.error('Error al sincronizar Instagram:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 