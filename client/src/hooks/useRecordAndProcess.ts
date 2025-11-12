import { useCallback } from "react";
import {
  RecordingDuration,
  SampleRate,
  type VocalTractResult,
} from "../contract";
import { getChannelDataAsFloat64 } from "../domains/audio";
import type { AppAction } from "../stores/app";

export function useRecordAndProcess(
  dispatch: React.Dispatch<AppAction>,
  startRecording: (
    sampleRate: number,
    duration: number
  ) => Promise<AudioBuffer>,
  workerRequest: <U = unknown>(data: unknown) => Promise<U> | undefined
) {
  const handler = useCallback(async () => {
    dispatch({ type: "START_RECORDING" });

    try {
      const buffer = await startRecording(SampleRate, RecordingDuration * 1000);

      dispatch({ type: "RECORDING_COMPLETE", audioBuffer: buffer });

      const float64Buffer = getChannelDataAsFloat64(buffer);
      const result = await workerRequest<VocalTractResult>({
        command: "Analyze",
        samples: float64Buffer,
        sampleRate: buffer.sampleRate,
      });
      if (!result) {
        dispatch({ type: "ERROR", error: "Worker request failed" });
        return;
      }
      dispatch({ type: "PROCESSING_COMPLETE", result });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "エラーが発生しました";

      dispatch({ type: "ERROR", error: errorMessage });
    }
  }, [dispatch, startRecording, workerRequest]);

  return handler;
}
