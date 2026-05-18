export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 animate-pulse">
      <div className="flex justify-end">
        <div className="bg-muted h-8 w-8 rounded-md" />
      </div>
      <div className="bg-card rounded-2xl border h-21" />
      <div className="flex flex-col gap-3">
        <div className="bg-muted h-11 w-full rounded-xl" />
        <div className="bg-muted h-11 w-full rounded-lg" />
      </div>
    </div>
  )
}
