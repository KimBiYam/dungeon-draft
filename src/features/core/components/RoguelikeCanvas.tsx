import { useEffect, useRef, useState } from 'react'

import { createRoguelikeGame } from '../engine/createRoguelikeGame'
import { useRuntimeStore } from '../store/runtimeStore'
import { useSessionStore } from '../store/sessionStore'

type RoguelikeCanvasProps = {
  enabled: boolean
}

export default function RoguelikeCanvas({ enabled }: RoguelikeCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [bootFailed, setBootFailed] = useState(false)
  const [ready, setReady] = useState(false)

  const heroClass = useSessionStore((state) => state.heroClass)
  const setHud = useSessionStore((state) => state.setHud)
  const pushLog = useSessionStore((state) => state.pushLog)
  const setLevelUpChoices = useSessionStore((state) => state.setLevelUpChoices)
  const setFloorEventChoices = useSessionStore((state) => state.setFloorEventChoices)
  const setApi = useRuntimeStore((state) => state.setApi)

  useEffect(() => {
    if (!enabled || !mountRef.current) {
      return
    }

    let disposed = false
    setBootFailed(false)
    setReady(false)

    createRoguelikeGame({
      mount: mountRef.current,
      initialHeroClass: heroClass,
      onState: setHud,
      onLog: pushLog,
      onLevelUpChoices: setLevelUpChoices,
      onFloorEventChoices: setFloorEventChoices,
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
  }, [
    enabled,
    heroClass,
    pushLog,
    setApi,
    setFloorEventChoices,
    setHud,
    setLevelUpChoices,
  ])

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-black">
      <div ref={mountRef} className="aspect-[10/7] w-full" />
      {!enabled ? (
        <div className="absolute inset-0 grid place-items-center bg-black/70 text-zinc-200">
          Select a class to start.
        </div>
      ) : null}
      {enabled && !ready && !bootFailed ? (
        <div className="absolute inset-0 grid place-items-center bg-black/70 text-zinc-200">
          Loading engine...
        </div>
      ) : null}
      {enabled && bootFailed ? (
        <div className="absolute inset-0 grid place-items-center bg-black/80 text-rose-300">
          Engine boot failed.
        </div>
      ) : null}
    </div>
  )
}
