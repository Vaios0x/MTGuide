import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

interface User {
  id: string
  name: string
  email: string
  role: 'CLIENT' | 'ADMIN'
  twoFactorEnabled: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  requires2FA: boolean
  tempCredentials: { email: string; password: string } | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  initializeAuth: () => void
  submit2FAToken: (token: string) => Promise<void>
  setup2FA: () => Promise<{ secret: string; qrCode: string }>
  enable2FA: (token: string) => Promise<string[]>
  disable2FA: (token: string) => Promise<void>
  verifyBackupCode: (code: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      requires2FA: false,
      tempCredentials: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          
          if (response.data.requires2FA) {
            set({
              requires2FA: true,
              tempCredentials: { email, password }
            })
            return
          }

          set({
            token: response.data.token,
            user: response.data.user,
            requires2FA: false,
            tempCredentials: null
          })

          // Configurar token en axios
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          requires2FA: false,
          tempCredentials: null
        })

        // Remover token de axios
        delete api.defaults.headers.common['Authorization']
      },

      initializeAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ isAuthenticated: true })
        }
      },

      submit2FAToken: async (token: string) => {
        const { tempCredentials } = get()
        if (!tempCredentials) {
          throw new Error('No hay credenciales temporales')
        }

        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', {
            ...tempCredentials,
            token
          })

          set({
            token: response.data.token,
            user: response.data.user,
            requires2FA: false,
            tempCredentials: null
          })

          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        } catch (error) {
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      setup2FA: async () => {
        const response = await api.post('/auth/2fa/setup')
        return response.data
      },

      enable2FA: async (token: string) => {
        const response = await api.post('/auth/2fa/enable', { token })
        set(state => ({
          user: state.user ? { ...state.user, twoFactorEnabled: true } : null
        }))
        return response.data.backupCodes
      },

      disable2FA: async (token: string) => {
        await api.post('/auth/2fa/disable', { token })
        set(state => ({
          user: state.user ? { ...state.user, twoFactorEnabled: false } : null
        }))
      },

      verifyBackupCode: async (code: string) => {
        const { tempCredentials } = get()
        if (!tempCredentials) {
          throw new Error('No hay credenciales temporales')
        }

        const response = await api.post('/auth/2fa/backup', {
          ...tempCredentials,
          code
        })

        set({
          token: response.data.token,
          user: response.data.user,
          requires2FA: false,
          tempCredentials: null
        })

        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
) 