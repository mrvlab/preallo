// A small spring in Apple's terms: damping ratio (1 = no overshoot) and response (seconds to
// get there). Starts from the current value and velocity, so a gesture hands off without a seam.
export function spring({
  from,
  to,
  velocity = 0,
  damping = 1,
  response = 0.35,
  onUpdate,
  onDone,
}: {
  from: number
  to: number
  velocity?: number
  damping?: number
  response?: number
  onUpdate: (value: number) => void
  onDone?: () => void
}) {
  const omega = (2 * Math.PI) / response
  const k = omega * omega
  const c = 2 * damping * omega
  let x = from
  let v = velocity
  let last = performance.now()
  let raf = 0
  const step = (now: number) => {
    // Clamp the frame time so a background tab does not explode the integration.
    const dt = Math.min(0.032, (now - last) / 1000)
    last = now
    v += (-k * (x - to) - c * v) * dt
    x += v * dt
    if (Math.abs(x - to) < 0.5 && Math.abs(v) < 5) {
      onUpdate(to)
      onDone?.()
      return
    }
    onUpdate(x)
    raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}

// Where a flick would come to rest, using the scroll-view deceleration curve Apple ships.
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

// Past a boundary the element follows less and less, so the edge feels soft instead of frozen.
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}
