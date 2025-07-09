import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Mountain, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Filosofía', href: '/filosofia' },
  {
    name: 'Experiencias',
    href: '/experiencias',
    children: [
      { name: 'Caminatas y Campamentos', href: '/experiencias/caminatas-y-campamentos' },
      { name: 'Educación de Montaña', href: '/experiencias/educacion-de-montana' },
      { name: 'Alta Montaña', href: '/experiencias/alta-montana' },
    ],
  },
  { name: 'Preparación Integral', href: '/preparacion-integral' },
  { name: 'Guía Personalizado', href: '/guia-personalizado' },
  { name: 'Sobre Mí', href: '/sobre-mi' },
  { name: 'Galería', href: '/galeria' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contacto', href: '/contacto' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [experienciasOpen, setExperienciasOpen] = useState(false)
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-display font-bold text-gray-900">
                MT Guide
              </span>
            </Link>
          </div>

          {/* Navegación desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setExperienciasOpen(true)}
                    onMouseLeave={() => setExperienciasOpen(false)}
                  >
                    <button
                      className={clsx(
                        'flex items-center space-x-1 text-sm font-medium transition-colors',
                        isActive(item.href)
                          ? 'text-primary-600'
                          : 'text-gray-700 hover:text-primary-600'
                      )}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    
                    {experienciasOpen && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={clsx(
                                'block px-4 py-2 text-sm transition-colors',
                                isActive(child.href)
                                  ? 'text-primary-600 bg-primary-50'
                                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                              )}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={clsx(
                      'text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    )}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Botón de menú móvil */}
          <div className="lg:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        className={clsx(
                          'flex items-center justify-between w-full px-3 py-2 text-base font-medium rounded-md transition-colors',
                          isActive(item.href)
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        )}
                        onClick={() => setExperienciasOpen(!experienciasOpen)}
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={clsx(
                          'h-4 w-4 transition-transform',
                          experienciasOpen && 'rotate-180'
                        )} />
                      </button>
                      
                      {experienciasOpen && (
                        <div className="pl-4 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={clsx(
                                'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                isActive(child.href)
                                  ? 'text-primary-600 bg-primary-50'
                                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={clsx(
                        'block px-3 py-2 text-base font-medium rounded-md transition-colors',
                        isActive(item.href)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 