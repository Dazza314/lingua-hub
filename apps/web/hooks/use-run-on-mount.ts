import { useEffect, useRef } from 'react'

export function useRunOnMount(fn: () => void) {
  const fnRef = useRef(fn)
  useEffect(() => {
    fnRef.current()
  }, [])
}
