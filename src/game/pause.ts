export interface PauseStateRef {
  current: boolean;
}

export function togglePauseState(pausedRef: PauseStateRef): boolean {
  pausedRef.current = !pausedRef.current;
  return pausedRef.current;
}
