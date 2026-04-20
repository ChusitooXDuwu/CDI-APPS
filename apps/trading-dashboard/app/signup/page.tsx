'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Si el email confirmation está desactivado, la sesión está lista
    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h1 className="font-display font-bold text-xl text-white mb-2">Cuenta creada</h1>
          <p className="text-muted text-sm">
            Revisa tu email para confirmar la cuenta, luego inicia sesión.
          </p>
          <Link href="/login" className="text-accent text-sm hover:underline mt-4 inline-block">
            Ir a login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-display font-bold text-lg tracking-tight text-white">
            CDI <span className="text-accent">Trading</span>
          </span>
        </Link>

        <h1 className="font-display font-bold text-2xl text-white mb-1">Crear cuenta</h1>
        <p className="text-muted text-sm mb-6">Empieza a gestionar tus portafolios</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted font-body uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1.5 bg-surface border border-[#1E1E22] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50 transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-muted font-body uppercase tracking-wider">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full mt-1.5 bg-surface border border-[#1E1E22] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50 transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <div className="text-negative text-xs bg-negative/10 border border-negative/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-bg font-bold py-2.5 rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-muted text-sm mt-6 text-center">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
