import { useEffect, useRef, useState } from 'react'

import { createRoguelikeGame } from '../engine/createRoguelikeGame'
import { useRuntimeStore } from '../store/runtimeStore'
import { useSessionStore } from '../store/sessionStore'

export default function RoguelikeCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [bootFailed, setBootFailed] = useState(false)
  const [ready, setReady] = useState(false)

  const setHud = useSessionStore((state) => state.setHud)
  const pushLog = useSessionStore((state) => state.pushLog)
  const setLevelUpChoices = useSessionStore((state) => state.setLevelUpChoices)
  const setApi = useRuntimeStore((state) => state.setApi)

  useEffect(() => {
    if (!mountRef.current) {
      return
    }

    let disposed = false

    void createRoguelikeGame({
      mount: mountRef.current,
      onState: setHud,
      onLog: pushLog,
      onLevelUpChoices: setLevelUpChoices,
    })
      .then((instance) => {
        if (disposed) {
          instance.destroy()
          return
        }
        setApi(instance)
        setReady(true)
      })
      .catch(() => {
        setBootFailed(true)
      })

    return () => {
      disposed = true
      setApi(null)
    }
  }, [pushLog, setApi, setHud, setLevelUpChoices])

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-black">
      <div ref={mountRef} className="aspect-16/10 w-full" />
      {!ready && !bootFailed ? (
        <div className="absolute inset-0 grid place-items-center bg-black/70 text-zinc-200">
          Loading engine...
        </div>
      ) : null}
      {bootFailed ? (
        <div className="absolute inset-0 grid place-items-center bg-black/80 text-rose-300">
          Engine boot failed.
        </div>
      ) : null}
    </div>
  )
}
