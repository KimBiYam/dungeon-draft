import { memo, useEffect, useRef, useState } from "react";

import {
  createRoguelikeGame,
  type HudState,
  type RoguelikeGameApi,
} from "../engine/createRoguelikeGame";

type RoguelikeCanvasProps = {
  onState: (state: HudState) => void;
  onLog: (message: string) => void;
  onReady: (api: RoguelikeGameApi | null) => void;
};

function RoguelikeCanvas({
  onState,
  onLog,
  onReady,
}: RoguelikeCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [bootFailed, setBootFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mountRef.current) {
      return;
    }

    let disposed = false;
    let api: RoguelikeGameApi | null = null;

    void createRoguelikeGame({
      mount: mountRef.current,
      onState,
      onLog,
    })
      .then((instance) => {
        if (disposed) {
          instance.destroy();
          return;
        }
        api = instance;
        onReady(instance);
        setReady(true);
      })
      .catch(() => {
        setBootFailed(true);
      });

    return () => {
      disposed = true;
      onReady(null);
      api?.destroy();
    };
  }, []);

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
  );
}

export default memo(RoguelikeCanvas);
