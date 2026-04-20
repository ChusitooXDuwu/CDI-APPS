import Link from 'next/link'

export default function NoAccessPage() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mx-auto mb-4 text-2xl">
          !
        </div>
        <h1 className="font-display font-bold text-xl text-white mb-2">Acceso restringido</h1>
        <p className="text-muted text-sm mb-6">
          El generador de miniaturas está disponible solo para usuarios autorizados.
          Contacta al admin si necesitas acceso.
        </p>
        <Link
          href="/"
          className="text-accent text-sm hover:underline inline-block"
        >
          ← Volver al dashboard
        </Link>
      </div>
    </main>
  )
}
