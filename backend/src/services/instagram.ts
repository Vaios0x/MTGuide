import axios from 'axios';
import { prisma } from '../server';

interface InstagramPost {
  id: string;
  media_url: string;
  caption?: string;
  permalink: string;
  timestamp: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
}

interface InstagramResponse {
  data: InstagramPost[];
  paging?: {
    next?: string;
    previous?: string;
  };
}

export async function syncInstagramPosts() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const userId = process.env.INSTAGRAM_USER_ID;

    if (!accessToken || !userId) {
      throw new Error('Instagram credentials not configured');
    }

    // Obtener posts de Instagram
    const response = await axios.get<InstagramResponse>(
      `https://graph.instagram.com/${userId}/media`,
      {
        params: {
          fields: 'id,media_url,caption,permalink,timestamp,media_type',
          access_token: accessToken,
          limit: 50, // Obtener los últimos 50 posts
        },
      }
    );

    const posts = response.data.data;

    // Filtrar solo imágenes (excluir videos por ahora)
    const imagePosts = posts.filter(post => post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM');

    // Sincronizar con la base de datos
    for (const post of imagePosts) {
      try {
        await prisma.instagramPost.upsert({
          where: {
            instagramId: post.id,
          },
          update: {
            imageUrl: post.media_url,
            caption: post.caption || null,
            permalink: post.permalink,
            timestamp: new Date(post.timestamp),
          },
          create: {
            instagramId: post.id,
            imageUrl: post.media_url,
            caption: post.caption || null,
            permalink: post.permalink,
            timestamp: new Date(post.timestamp),
          },
        });
      } catch (error) {
        console.error(`Error al sincronizar post ${post.id}:`, error);
      }
    }

    // Limpiar posts antiguos (mantener solo los últimos 100)
    const totalPosts = await prisma.instagramPost.count();
    if (totalPosts > 100) {
      const postsToDelete = await prisma.instagramPost.findMany({
        orderBy: {
          timestamp: 'desc',
        },
        skip: 100,
        select: {
          id: true,
        },
      });

      if (postsToDelete.length > 0) {
        await prisma.instagramPost.deleteMany({
          where: {
            id: {
              in: postsToDelete.map(p => p.id),
            },
          },
        });
      }
    }

    console.log(`Sincronizados ${imagePosts.length} posts de Instagram`);
    return imagePosts.length;
  } catch (error) {
    console.error('Error al sincronizar Instagram:', error);
    throw error;
  }
}

export async function getInstagramPosts(limit: number = 20) {
  try {
    const posts = await prisma.instagramPost.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return posts;
  } catch (error) {
    console.error('Error al obtener posts de Instagram:', error);
    throw error;
  }
}

export async function refreshInstagramToken() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('Instagram access token not configured');
    }

    // Renovar token de larga duración
    const response = await axios.get(
      'https://graph.instagram.com/refresh_access_token',
      {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        },
      }
    );

    console.log('Token de Instagram renovado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al renovar token de Instagram:', error);
    throw error;
  }
} 