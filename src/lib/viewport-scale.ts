// Sets `--sw` on <html> from the viewport width so every rem-based value scales.
// Inlined as a pre-paint <script> via toString(), so it must stay self-contained:
// no imports and no references outside the function body.
export function initViewportScale() {
  const SMALL_MAX = 374
  const REFERENCE_WIDTH = 375
  const LARGE_MIN = 1820
  const LARGE_ANCHOR = 1640
  const LARGE_BASE = 0.95
  const LARGE_GAIN = 0.4
  const DEBOUNCE_MS = 100

  const root = document.documentElement

  function calculateSize() {
    const width = root.clientWidth
    let size = 1
    if (width < SMALL_MAX) {
      size = width / REFERENCE_WIDTH
    } else if (width > LARGE_MIN) {
      size = LARGE_BASE + ((width - LARGE_ANCHOR) / LARGE_ANCHOR) * LARGE_GAIN
    }
    root.style.setProperty('--sw', size.toString())
  }

  function debounce(fn: () => void, wait: number) {
    let timeout: ReturnType<typeof setTimeout>
    return function () {
      clearTimeout(timeout)
      timeout = setTimeout(fn, wait)
    }
  }

  const onResize = debounce(calculateSize, DEBOUNCE_MS)
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)

  // Docking a laptop changes devicePixelRatio without a resize event.
  ;(function watchDevicePixelRatio() {
    matchMedia('(resolution: ' + window.devicePixelRatio + 'dppx)').addEventListener(
      'change',
      function () {
        calculateSize()
        watchDevicePixelRatio()
      },
      { once: true },
    )
  })()

  calculateSize()
}
