import { startTransition, useActionState, useCallback } from "react";
import { useWorker } from "./hooks/useWorker";

function App() {
  const workerRequest = useWorker("/vtlib/worker.js");

  const [callResult, callFunc, isPending] = useActionState(async () => {
    const result = await workerRequest<number>({ command: "sampleCall" });
    return result;
  }, 0);
  const handleClick = useCallback(() => {
    startTransition(() => {
      callFunc();
    });
  }, [callFunc]);

  return (
    <>
      <button onClick={handleClick} disabled={isPending}>
        Call Worker
      </button>
      <div>Result: {callResult ?? "No result"}</div>
      {isPending && <div>Loading...</div>}
    </>
  );
}

export default App;
