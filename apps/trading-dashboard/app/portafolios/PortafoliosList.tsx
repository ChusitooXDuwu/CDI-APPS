'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Portafolio {
  id: string
  nombre: string
  descripcion: string | null
  created_at: string
}

export default function PortafoliosList({ initial }: { initial: Portafolio[] }) {
  const [portafolios, setPortafolios] = useState<Portafolio[]>(initial)
  const [showForm, setShowForm]       = useState(false)
  const [nombre, setNombre]           = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('portafolios')
      .insert({ user_id: user.id, nombre: nombre.trim(), descripcion: descripcion.trim() || null })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setPortafolios([data as Portafolio, ...portafolios])
    setNombre('')
    setDescripcion('')
    setShowForm(false)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este portafolio y todas sus posiciones?')) return
    const supabase = createClient()
    const { error } = await supabase.from('portafolios').delete().eq('id', id)
    if (!error) setPortafolios(portafolios.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Mis Portafolios</h2>
          <p className="text-muted text-sm mt-1">Gestiona tus estrategias de inversión</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-bg font-bold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors text-sm"
        >
          {showForm ? 'Cancelar' : '+ Nuevo portafolio'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface border border-[#1E1E22] rounded-xl p-5 space-y-3">
          <div>
            <label className="text-xs text-muted font-body uppercase tracking-wider">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              maxLength={60}
              autoFocus
              className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50 transition-colors"
              placeholder="Ej: Largo Plazo, Swing Trade, Cripto..."
            />
          </div>
          <div>
            <label className="text-xs text-muted font-body uppercase tracking-wider">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              maxLength={200}
              className="w-full mt-1.5 bg-bg border border-[#1E1E22] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent/50 transition-colors resize-none"
              placeholder="Estrategia, objetivo, etc."
            />
          </div>

          {error && <p className="text-negative text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-accent text-bg font-bold px-4 py-2 rounded-lg hover:bg-accent/90 disabled:opacity-50 text-sm"
          >
            {loading ? 'Creando...' : 'Crear'}
          </button>
        </form>
      )}

      {portafolios.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-[#1E1E22] rounded-xl">
          <p className="text-muted text-sm">No tienes portafolios aún.</p>
          <p className="text-muted text-xs mt-1">Crea uno para empezar a registrar posiciones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portafolios.map((p) => (
            <div key={p.id} className="group bg-surface border border-[#1E1E22] rounded-xl p-5 hover:border-accent/40 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link href={`/portafolios/${p.id}`}>
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-accent transition-colors cursor-pointer">
                      {p.nombre}
                    </h3>
                  </Link>
                  {p.descripcion && (
                    <p className="text-muted text-sm mt-1 line-clamp-2">{p.descripcion}</p>
                  )}
                  <p className="text-xs text-muted font-mono mt-3">
                    Creado {new Date(p.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-muted hover:text-negative opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                  title="Eliminar"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
