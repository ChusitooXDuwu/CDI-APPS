export function hasMiniaturasAccess(email: string | null | undefined): boolean {
  if (!email) return false
  const whitelist = (process.env.MINIATURAS_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return whitelist.includes(email.toLowerCase())
}
