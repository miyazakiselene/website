export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-6xl px-4">{children}</div>
    </main>
  )
}
