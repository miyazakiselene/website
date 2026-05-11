export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">{children}</div>
    </main>
  )
}
