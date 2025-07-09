import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useEffect } from 'react'

// Layouts
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'

// Páginas públicas
import HomePage from './pages/HomePage'
import ExperiencesPage from './pages/ExperiencesPage'
import ExperienceDetailPage from './pages/ExperienceDetailPage'
import AboutPage from './pages/AboutPage'
import GalleryPage from './pages/GalleryPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ContactPage from './pages/ContactPage'
import CustomGuidePage from './pages/CustomGuidePage'
import PreparationPage from './pages/PreparationPage'
import PhilosophyPage from './pages/PhilosophyPage'
import BookingPage from './pages/BookingPage'
import PaymentPage from './pages/PaymentPage'
import BookingConfirmationPage from './pages/BookingConfirmationPage'

// Páginas de admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminExperiences from './pages/admin/AdminExperiences'
import AdminBookings from './pages/admin/AdminBookings'
import AdminBlog from './pages/admin/AdminBlog'
import AdminTestimonials from './pages/admin/AdminTestimonials'
import AdminContacts from './pages/admin/AdminContacts'
import AdminLogin from './pages/admin/AdminLogin'

// Componentes de protección
import ProtectedRoute from './components/ProtectedRoute'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="filosofia" element={<PhilosophyPage />} />
        <Route path="experiencias">
          <Route index element={<ExperiencesPage />} />
          <Route path="caminatas-y-campamentos" element={<ExperiencesPage />} />
          <Route path="educacion-de-montana" element={<ExperiencesPage />} />
          <Route path="alta-montana" element={<ExperiencesPage />} />
          <Route path=":slug" element={<ExperienceDetailPage />} />
        </Route>
        <Route path="preparacion-integral" element={<PreparationPage />} />
        <Route path="guia-personalizado" element={<CustomGuidePage />} />
        <Route path="sobre-mi" element={<AboutPage />} />
        <Route path="galeria" element={<GalleryPage />} />
        <Route path="blog">
          <Route index element={<BlogPage />} />
          <Route path=":slug" element={<BlogPostPage />} />
        </Route>
        <Route path="contacto" element={<ContactPage />} />
        <Route path="reservar/:slug" element={<BookingPage />} />
        <Route path="pago/:bookingId" element={<PaymentPage />} />
        <Route path="confirmacion/:bookingId" element={<BookingConfirmationPage />} />
      </Route>

      {/* Rutas de administración */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="experiencias" element={<AdminExperiences />} />
        <Route path="reservas" element={<AdminBookings />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="testimonios" element={<AdminTestimonials />} />
        <Route path="contactos" element={<AdminContacts />} />
      </Route>

      {/* Página 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App 