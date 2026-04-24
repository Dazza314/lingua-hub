export function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <p className="text-muted-foreground text-center text-sm">{children}</p>
    </div>
  )
}
