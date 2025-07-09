import { Link } from 'react-router-dom'
import { ArrowRight, Mountain, Users, Award, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import TestimonialCard from '../components/TestimonialCard'
import ExperienceCard from '../components/ExperienceCard'

export default function HomePage() {
  // Obtener experiencias destacadas
  const { data: experiences } = useQuery({
    queryKey: ['experiences', { limit: 3 }],
    queryFn: async () => {
      const response = await api.get('/experiences?limit=3')
      return response.data
    },
  })

  // Obtener testimonios
  const { data: testimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const response = await api.get('/admin/testimonials?limit=3')
      return response.data
    },
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 animate-fade-in-up">
            Más que una Cima
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Fórmate, Prepárate y Conquista las Montañas de México con Guías Expertos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/experiencias"
              className="btn btn-primary btn-lg"
            >
              Explorar Experiencias
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/filosofia"
              className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-gray-900"
            >
              Nuestra Filosofía
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Sección de categorías */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Tu Escuela de Montaña
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestras tres categorías principales diseñadas para llevarte desde 
              tus primeros pasos hasta las cimas más desafiantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Iniciación */}
            <div className="card-hover p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Iniciación</h3>
              <p className="text-gray-600 mb-6">
                Caminatas y campamentos para principiantes. Aprende los fundamentos 
                del montañismo en un ambiente seguro y divertido.
              </p>
              <Link
                to="/experiencias/caminatas-y-campamentos"
                className="btn btn-primary"
              >
                Ver Experiencias
              </Link>
            </div>

            {/* Formación */}
            <div className="card-hover p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Formación</h3>
              <p className="text-gray-600 mb-6">
                Cursos especializados y talleres técnicos. Desarrolla habilidades 
                avanzadas con certificaciones reconocidas.
              </p>
              <Link
                to="/experiencias/educacion-de-montana"
                className="btn btn-primary"
              >
                Ver Cursos
              </Link>
            </div>

            {/* Expediciones */}
            <div className="card-hover p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mountain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expediciones</h3>
              <p className="text-gray-600 mb-6">
                Alta montaña y desafíos extremos. Para montañistas experimentados 
                que buscan conquistar las cimas más altas.
              </p>
              <Link
                to="/experiencias/alta-montana"
                className="btn btn-primary"
              >
                Ver Expediciones
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Experiencias destacadas */}
      {experiences && experiences.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                Experiencias Destacadas
              </h2>
              <p className="text-lg text-gray-600">
                Descubre nuestras experiencias más populares
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experiences.map((experience: any) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/experiencias"
                className="btn btn-outline btn-lg"
              >
                Ver Todas las Experiencias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sección de estadísticas */}
      <section className="section-padding hero-gradient text-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Montañistas Formados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Cimas Conquistadas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-blue-200">Años de Experiencia</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-200">Seguridad Garantizada</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      {testimonials && testimonials.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                Lo que Dicen Nuestros Montañistas
              </h2>
              <p className="text-lg text-gray-600">
                Experiencias reales de quienes han vivido la montaña con nosotros
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial: any) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            ¿Listo para tu Próxima Aventura?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Únete a nuestra comunidad de montañistas y descubre tu potencial en las alturas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/experiencias"
              className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Reservar Experiencia
            </Link>
            <Link
              to="/guia-personalizado"
              className="btn btn-lg border-white text-white hover:bg-white hover:text-primary-600"
            >
              Solicitar Guía Personalizado
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 