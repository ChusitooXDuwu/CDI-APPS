'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const dest = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/'
    router.push(dest)
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span className="font-display font-bold text-lg tracking-tight text-white">
          CDI <span className="text-accent">Trading</span>
        </span>
      </Link>

      <h1 className="font-display font-bold text-2xl text-white mb-1">Iniciar sesión</h1>
      <p className="text-muted text-sm mb-6">Accede a tu cuenta</p>

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
            placeholder="••••••••"
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
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-muted text-sm mt-6 text-center">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="text-accent hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      }>
        <LoginForm />
      </Suspense>
    </main>
  )
}
