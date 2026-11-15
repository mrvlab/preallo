'use client'

import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react'

type ToastFn = (message: string, undo?: () => void) => void

const Ctx = createContext<ToastFn | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ message: string; undo?: () => void } | null>(null)
  const [show, setShow] = useState(false)
  const timer = useRef<number | null>(null)

  const toast = useCallback<ToastFn>((message, undo) => {
    setState({ message, undo })
    setShow(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setShow(false), undo ? 5500 : 2600)
  }, [])

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div
        className="pa-toast flex w-max max-w-[calc(100%-32px)] items-center gap-3.5 rounded-[var(--radius-5)] bg-[#1c1c1e] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_8px_28px_rgba(0,0,0,.35)]"
        data-show={show}
        role="status"
        aria-live="polite"
      >
        <span>{state?.message}</span>
        {state?.undo && (
          <button
            className="font-extrabold text-[#7db8ff]"
            onClick={() => {
              state.undo?.()
              setShow(false)
            }}
          >
            Undo
          </button>
        )}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
