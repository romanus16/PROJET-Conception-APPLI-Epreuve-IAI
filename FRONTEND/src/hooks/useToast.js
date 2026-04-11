import { useState, useCallback } from 'react'

let _id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info') => {
    const id = ++_id
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const remove = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), [])

  return { toasts, toast, remove }
}