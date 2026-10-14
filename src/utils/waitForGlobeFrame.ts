/** Waits for scene readiness without an arbitrary minimum loading duration. */
export function waitForGlobeFrame(ready: () => boolean, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted()
  return new Promise((resolve, reject) => {
    let frame = 0
    const deadline = performance.now() + 15000
    function cleanup() {
      cancelAnimationFrame(frame)
      signal.removeEventListener('abort', onAbort)
    }
    function onAbort() {
      cleanup()
      reject(signal.reason)
    }
    function check() {
      if (ready()) {
        cleanup()
        resolve()
      } else if (performance.now() > deadline) {
        cleanup()
        reject(new Error('地球首帧准备超时'))
      } else frame = requestAnimationFrame(check)
    }
    signal.addEventListener('abort', onAbort, { once: true })
    frame = requestAnimationFrame(check)
  })
}
