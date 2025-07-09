import { create } from 'zustand'

interface BookingData {
  experienceId: string
  experienceDateId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  attendees: number
  notes?: string
}

interface BookingState {
  currentBooking: BookingData | null
  selectedDate: string | null
  isLoading: boolean
  setBookingData: (data: BookingData) => void
  setSelectedDate: (dateId: string) => void
  clearBooking: () => void
  setLoading: (loading: boolean) => void
}

export const useBookingStore = create<BookingState>((set) => ({
  currentBooking: null,
  selectedDate: null,
  isLoading: false,

  setBookingData: (data: BookingData) => {
    set({ currentBooking: data })
  },

  setSelectedDate: (dateId: string) => {
    set({ selectedDate: dateId })
  },

  clearBooking: () => {
    set({
      currentBooking: null,
      selectedDate: null,
      isLoading: false,
    })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
})) 