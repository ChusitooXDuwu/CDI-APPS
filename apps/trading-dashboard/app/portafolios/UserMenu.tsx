'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UserMenu({ email }: { email: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted font-mono hidden md:block">{email}</span>
      <button
        onClick={handleLogout}
        className="text-xs text-muted hover:text-negative font-mono transition-colors"
      >
        Salir
      </button>
    </div>
  )
}
