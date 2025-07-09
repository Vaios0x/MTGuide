import { Star } from 'lucide-react'
import { Testimonial } from '../lib/api'

interface TestimonialCardProps {
  testimonial: Testimonial
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < testimonial.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      <blockquote className="text-gray-700 mb-4">
        "{testimonial.content}"
      </blockquote>
      
      <div className="flex items-center">
        {testimonial.imageUrl && (
          <img
            src={testimonial.imageUrl}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
        )}
        <div>
          <div className="font-semibold text-gray-900">{testimonial.name}</div>
          {testimonial.experience && (
            <div className="text-sm text-gray-500">{testimonial.experience.title}</div>
          )}
        </div>
      </div>
    </div>
  )
} 