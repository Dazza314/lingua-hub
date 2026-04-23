export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 animate-pulse">
      <div className="bg-card rounded-2xl border p-6 flex flex-col gap-4">
        <div className="bg-muted h-4 w-1/3 rounded" />
        <div className="bg-muted h-7 w-full rounded" />
        <div className="bg-muted h-7 w-2/3 rounded" />
      </div>
      <div className="bg-muted min-h-28 w-full rounded-xl" />
      <div className="bg-muted h-11 w-full rounded-lg" />
    </div>
  )
}
