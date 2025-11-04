import { useCallback, useEffect, useRef } from "react";
import { WorkerContainer } from "../WorkerContainer";

export function useWorker(workerUrl: string) {
  const wrapperRef = useRef<WorkerContainer | null>(null);

  useEffect(() => {
    wrapperRef.current = new WorkerContainer(workerUrl);
    return () => {
      wrapperRef.current?.terminate();
    };
  }, [workerUrl]);

  const callWorker = useCallback(<U = unknown>(data: unknown) => {
    return wrapperRef.current?.postMessage<U>(data);
  }, []);

  return callWorker;
}
