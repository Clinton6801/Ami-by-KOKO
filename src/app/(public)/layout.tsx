/**
 * Public layout — wraps landing, login, and signup pages.
 * Landing page gets full width; auth pages get centred card layout.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
