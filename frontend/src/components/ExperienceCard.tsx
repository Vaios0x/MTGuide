import { Link } from 'react-router-dom'
import { Calendar, Users, MapPin, Clock } from 'lucide-react'
import { Experience } from '../lib/api'

interface ExperienceCardProps {
  experience: Experience
}

const categoryLabels = {
  INICIACION: 'Iniciación',
  FORMACION: 'Formación',
  EXPEDICION: 'Expedición'
}

const difficultyLabels = {
  PRINCIPIANTE: 'Principiante',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
  EXPERTO: 'Experto'
}

const difficultyColors = {
  PRINCIPIANTE: 'bg-green-100 text-green-800',
  INTERMEDIO: 'bg-yellow-100 text-yellow-800',
  AVANZADO: 'bg-orange-100 text-orange-800',
  EXPERTO: 'bg-red-100 text-red-800'
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const nextDate = experience.dates?.[0]
  
  return (
    <div className="card-hover overflow-hidden">
      {/* Imagen */}
      <div className="aspect-ratio-4-3 overflow-hidden">
        <img
          src={experience.images[0] || 'https://images.unsplash.com/photo-1464822759844-d150baec3e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      {/* Contenido */}
      <div className="p-6">
        {/* Categoría y dificultad */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-primary-600">
            {categoryLabels[experience.category]}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[experience.difficulty]}`}>
            {difficultyLabels[experience.difficulty]}
          </span>
        </div>
        
        {/* Título */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {experience.title}
        </h3>
        
        {/* Descripción */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {experience.description}
        </p>
        
        {/* Información adicional */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            <span>{experience.duration}</span>
          </div>
          
          {nextDate && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Próxima fecha: {new Date(nextDate.startDate).toLocaleDateString('es-ES')}
              </span>
            </div>
          )}
        </div>
        
        {/* Precio y botón */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${experience.price.toLocaleString('es-MX')}
            </span>
            <span className="text-sm text-gray-500 ml-1">MXN</span>
          </div>
          
          <Link
            to={`/experiencias/${experience.slug}`}
            className="btn btn-primary"
          >
            Ver Detalles
          </Link>
        </div>
      </div>
    </div>
  )
} 