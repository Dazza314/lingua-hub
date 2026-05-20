import { PracticeHeader } from './_components/PracticeHeader'

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      <PracticeHeader
        right={<div className="bg-muted h-8 w-8 rounded-md animate-pulse" />}
      />
      <div className="bg-card rounded-2xl border h-21 animate-pulse" />
      <div className="flex flex-col gap-3">
        <div className="bg-muted h-11 w-full rounded-xl animate-pulse" />
        <div className="bg-muted h-11 w-full rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
