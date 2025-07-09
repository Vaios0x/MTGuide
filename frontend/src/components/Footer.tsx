import { Link } from 'react-router-dom'
import { Mountain, Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-mountain-900 text-white">
      <div className="container-custom">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo y descripción */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-display font-bold">
                  MT Guide
                </span>
              </div>
              <p className="text-mountain-300 mb-6 max-w-md">
                Más que una cima. Fórmate, prepárate y conquista las montañas de México 
                con guías expertos. Tu escuela de montaña de confianza.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/mtguide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mountain-400 hover:text-primary-400 transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href="https://facebook.com/mtguide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mountain-400 hover:text-primary-400 transition-colors"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/experiencias/caminatas-y-campamentos"
                    className="text-mountain-300 hover:text-white transition-colors"
                  >
                    Caminatas y Campamentos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/experiencias/educacion-de-montana"
                    className="text-mountain-300 hover:text-white transition-colors"
                  >
                    Educación de Montaña
                  </Link>
                </li>
                <li>
                  <Link
                    to="/experiencias/alta-montana"
                    className="text-mountain-300 hover:text-white transition-colors"
                  >
                    Alta Montaña
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guia-personalizado"
                    className="text-mountain-300 hover:text-white transition-colors"
                  >
                    Guía Personalizado
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-mountain-300 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Información de contacto */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary-400 flex-shrink-0" />
                  <a
                    href="mailto:info@mtguide.com"
                    className="text-mountain-300 hover:text-white transition-colors"
                  >
                    info@mtguide.com
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary-400 flex-shrink-0" />
                  <a
                    href="tel:+525512345678"
                    className="text-mountain-300 hover:text-white transition-colors"
                  >
                    +52 55 1234 5678
                  </a>
                </li>
                <li className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <span className="text-mountain-300">
                    Ciudad de México, México
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-mountain-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-mountain-400 text-sm">
              © {new Date().getFullYear()} MT Guide. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/terminos"
                className="text-mountain-400 hover:text-white text-sm transition-colors"
              >
                Términos y Condiciones
              </Link>
              <Link
                to="/privacidad"
                className="text-mountain-400 hover:text-white text-sm transition-colors"
              >
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 