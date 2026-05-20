export function PracticeHeader({ right }: { right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-lg font-semibold">Practice</h1>
      {right}
    </div>
  )
}
