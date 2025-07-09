import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth-storage')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// Tipos para las respuestas de la API
export interface Experience {
  id: string
  title: string
  slug: string
  description: string
  content: string
  category: 'INICIACION' | 'FORMACION' | 'EXPEDICION'
  difficulty: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO' | 'EXPERTO'
  duration: string
  price: number
  includes: string[]
  excludes: string[]
  images: string[]
  videoUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  dates: ExperienceDate[]
  testimonials: Testimonial[]
  _count?: {
    testimonials: number
  }
}

export interface ExperienceDate {
  id: string
  experienceId: string
  startDate: string
  endDate: string
  maxAttendees: number
  price?: number
  isActive: boolean
  availableSpots?: number
  isAvailable?: boolean
  _count?: {
    bookings: number
  }
}

export interface Booking {
  id: string
  experienceId: string
  experienceDateId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  attendees: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  totalAmount: number
  paidAmount: number
  stripePaymentId?: string
  notes?: string
  createdAt: string
  updatedAt: string
  experience: {
    title: string
    slug: string
  }
  experienceDate: {
    startDate: string
    endDate: string
  }
}

export interface Testimonial {
  id: string
  experienceId?: string
  name: string
  content: string
  rating: number
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  experience?: {
    title: string
    slug: string
  }
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  categoryId?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  category?: {
    name: string
    slug: string
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
  _count?: {
    posts: number
  }
}

export interface InstagramPost {
  id: string
  instagramId: string
  imageUrl: string
  caption?: string
  permalink: string
  timestamp: string
  createdAt: string
  updatedAt: string
}

export interface ContactForm {
  id: string
  type: 'GENERAL' | 'CUSTOM_GUIDE'
  name: string
  email: string
  phone?: string
  message: string
  dateRange?: string
  mountainType?: string
  experience?: string
  budget?: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface PaymentIntent {
  clientSecret: string
  paymentIntentId: string
}

export interface DashboardStats {
  totalExperiences: number
  totalBookings: number
  totalRevenue: number
  pendingBookings: number
  recentBookings: Booking[]
  popularExperiences: Experience[]
} 