'use client'

import { FieldSelect } from './FieldSelect'
import { Message } from './Message'
import { useImportPage } from './useImportPage'

export function AndroidImportPage() {
  const {
    state,
    requestPermission,
    selectLayout,
    back,
    setTerm,
    setDefinition,
    setReading,
    sync,
    reset,
  } = useImportPage()

  if (state.phase === 'checking-permission' || state.phase === 'loading-layouts') {
    return <Message>Loading…</Message>
  }

  if (state.phase === 'permission-denied') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground text-center text-sm">
          AnkiDroid access is required to import vocabulary.
        </p>
        <button
          className="text-primary text-sm underline-offset-4 hover:underline"
          onClick={() => void requestPermission()}
        >
          Grant access
        </button>
      </div>
    )
  }

  if (state.phase === 'layout-error') {
    return <Message>{state.message}</Message>
  }

  if (state.phase === 'picking-layout') {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-6">
        <h2 className="text-sm font-medium">Select a note type</h2>
        <ul className="flex flex-col gap-2">
          {state.layouts.map((layout) => (
            <li key={layout.id}>
              <button
                className="bg-card w-full rounded-xl border p-4 text-left"
                onClick={() => selectLayout(layout)}
              >
                <p className="font-medium">{layout.name}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {layout.fields.join(', ')}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (state.phase === 'mapping') {
    const { layout, term, definition, reading } = state
    const fieldOptions = ['', ...layout.fields]
    const canSync = !!term && !!definition

    return (
      <div className="flex flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex items-center gap-2">
          <button
            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
            onClick={back}
          >
            ← Back
          </button>
          <h2 className="text-sm font-medium">{layout.name}</h2>
        </div>

        <div className="flex flex-col gap-4">
          <FieldSelect
            label="Term"
            required
            fields={fieldOptions}
            value={term}
            sampleValues={layout.sampleValues}
            onChange={setTerm}
          />
          <FieldSelect
            label="Definition"
            required
            fields={fieldOptions}
            value={definition}
            sampleValues={layout.sampleValues}
            onChange={setDefinition}
          />
          <FieldSelect
            label="Reading"
            fields={fieldOptions}
            value={reading}
            sampleValues={layout.sampleValues}
            onChange={setReading}
          />
        </div>

        <button
          className="bg-primary text-primary-foreground rounded-xl px-4 py-3 text-sm font-medium disabled:opacity-50"
          disabled={!canSync}
          onClick={() => void sync()}
        >
          Import
        </button>
      </div>
    )
  }

  if (state.phase === 'syncing') {
    return <Message>Importing…</Message>
  }

  if (state.phase === 'sync-success') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-sm">
          Imported {state.count} {state.count === 1 ? 'item' : 'items'}.
        </p>
        <button
          className="text-primary text-sm underline-offset-4 hover:underline"
          onClick={reset}
        >
          Import again
        </button>
      </div>
    )
  }

  if (state.phase === 'sync-error') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground text-center text-sm">{state.message}</p>
        <button
          className="text-primary text-sm underline-offset-4 hover:underline"
          onClick={reset}
        >
          Try again
        </button>
      </div>
    )
  }
}
