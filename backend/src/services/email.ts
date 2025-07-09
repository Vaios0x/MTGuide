import { Resend } from 'resend';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingWithDetails {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  attendees: number;
  totalAmount: number;
  paidAmount: number;
  experience: {
    title: string;
    description: string;
  };
  experienceDate: {
    startDate: Date;
    endDate: Date;
  };
}

export async function sendBookingConfirmationEmail(booking: BookingWithDetails) {
  try {
    const startDate = format(booking.experienceDate.startDate, 'PPP', { locale: es });
    const endDate = format(booking.experienceDate.endDate, 'PPP', { locale: es });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Reserva - MT Guide</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 1.2em; color: #667eea; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Reserva Confirmada!</h1>
            <p>MT Guide - Escuela de Montaña</p>
          </div>
          
          <div class="content">
            <h2>Hola ${booking.clientName},</h2>
            <p>Tu reserva ha sido confirmada exitosamente. Aquí tienes los detalles:</p>
            
            <div class="booking-details">
              <h3>${booking.experience.title}</h3>
              <div class="detail-row">
                <span>Fecha de inicio:</span>
                <span>${startDate}</span>
              </div>
              <div class="detail-row">
                <span>Fecha de fin:</span>
                <span>${endDate}</span>
              </div>
              <div class="detail-row">
                <span>Número de personas:</span>
                <span>${booking.attendees}</span>
              </div>
              <div class="detail-row">
                <span>Anticipo pagado:</span>
                <span>$${booking.paidAmount.toLocaleString('es-MX')} MXN</span>
              </div>
              <div class="detail-row total">
                <span>Total de la experiencia:</span>
                <span>$${booking.totalAmount.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>
            
            <h3>Próximos pasos:</h3>
            <ul>
              <li>Te contactaremos 48 horas antes de la experiencia para confirmar detalles</li>
              <li>Recibirás una lista de equipo recomendado por email</li>
              <li>El saldo restante se paga el día de la experiencia</li>
            </ul>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            
            <p>¡Nos vemos en la montaña!</p>
            <p><strong>Equipo MT Guide</strong></p>
          </div>
          
          <div class="footer">
            <p>MT Guide - Escuela de Montaña</p>
            <p>Email: info@mtguide.com | Teléfono: +52 55 1234 5678</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: 'MT Guide <reservas@mtguide.com>',
      to: booking.clientEmail,
      subject: `Confirmación de Reserva - ${booking.experience.title}`,
      html: emailHtml,
    });

    console.log(`Email de confirmación enviado a ${booking.clientEmail}`);
  } catch (error) {
    console.error('Error al enviar email de confirmación:', error);
    throw error;
  }
}

export async function sendContactFormEmail(contactData: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  type: 'GENERAL' | 'CUSTOM_GUIDE';
  dateRange?: string;
  mountainType?: string;
  experience?: string;
  budget?: string;
}) {
  try {
    const isCustomGuide = contactData.type === 'CUSTOM_GUIDE';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo Contacto - MT Guide</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .contact-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuevo ${isCustomGuide ? 'Solicitud de Guía Personalizado' : 'Contacto General'}</h1>
          </div>
          
          <div class="content">
            <div class="contact-details">
              <div class="detail-row">
                <div class="label">Nombre:</div>
                <div>${contactData.name}</div>
              </div>
              <div class="detail-row">
                <div class="label">Email:</div>
                <div>${contactData.email}</div>
              </div>
              ${contactData.phone ? `
              <div class="detail-row">
                <div class="label">Teléfono:</div>
                <div>${contactData.phone}</div>
              </div>
              ` : ''}
              
              ${isCustomGuide ? `
              ${contactData.dateRange ? `
              <div class="detail-row">
                <div class="label">Rango de fechas:</div>
                <div>${contactData.dateRange}</div>
              </div>
              ` : ''}
              ${contactData.mountainType ? `
              <div class="detail-row">
                <div class="label">Tipo de montaña:</div>
                <div>${contactData.mountainType}</div>
              </div>
              ` : ''}
              ${contactData.experience ? `
              <div class="detail-row">
                <div class="label">Experiencia previa:</div>
                <div>${contactData.experience}</div>
              </div>
              ` : ''}
              ${contactData.budget ? `
              <div class="detail-row">
                <div class="label">Presupuesto estimado:</div>
                <div>${contactData.budget}</div>
              </div>
              ` : ''}
              ` : ''}
              
              <div class="detail-row">
                <div class="label">Mensaje:</div>
                <div>${contactData.message}</div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: 'MT Guide <contacto@mtguide.com>',
      to: 'info@mtguide.com', // Email del administrador
      subject: `Nuevo ${isCustomGuide ? 'Solicitud de Guía Personalizado' : 'Contacto'} - ${contactData.name}`,
      html: emailHtml,
      replyTo: contactData.email,
    });

    console.log(`Email de contacto enviado para ${contactData.name}`);
  } catch (error) {
    console.error('Error al enviar email de contacto:', error);
    throw error;
  }
}

export async function sendBookingReminderEmail(booking: BookingWithDetails) {
  try {
    const startDate = format(booking.experienceDate.startDate, 'PPP', { locale: es });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recordatorio de Experiencia - MT Guide</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Tu experiencia es mañana!</h1>
          </div>
          
          <div class="content">
            <h2>Hola ${booking.clientName},</h2>
            
            <div class="reminder-box">
              <h3>Recordatorio: ${booking.experience.title}</h3>
              <p><strong>Fecha:</strong> ${startDate}</p>
              <p><strong>Número de personas:</strong> ${booking.attendees}</p>
            </div>
            
            <h3>Preparativos importantes:</h3>
            <ul>
              <li>Revisa la lista de equipo que te enviamos</li>
              <li>Verifica el punto de encuentro</li>
              <li>Trae el saldo restante: $${(booking.totalAmount - booking.paidAmount).toLocaleString('es-MX')} MXN</li>
              <li>Llega 15 minutos antes de la hora acordada</li>
            </ul>
            
            <p>¡Nos vemos mañana en la montaña!</p>
            <p><strong>Equipo MT Guide</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: 'MT Guide <recordatorios@mtguide.com>',
      to: booking.clientEmail,
      subject: `Recordatorio: ${booking.experience.title} - Mañana`,
      html: emailHtml,
    });

    console.log(`Email de recordatorio enviado a ${booking.clientEmail}`);
  } catch (error) {
    console.error('Error al enviar email de recordatorio:', error);
    throw error;
  }
} 