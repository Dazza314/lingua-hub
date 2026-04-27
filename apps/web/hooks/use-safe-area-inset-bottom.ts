function readSafeAreaInsetBottom(): number {
  if (typeof document === 'undefined') {
    return 0
  }
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--sab'),
  )
}

export function useSafeAreaInsetBottom(): number {
  return readSafeAreaInsetBottom()
}
