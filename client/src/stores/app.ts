import type { VocalTractResult } from "../contract";

export type AppState =
  | { type: "idle" }
  | { type: "recording" }
  | { type: "processing"; audioBuffer: AudioBuffer }
  | { type: "completed"; audioBuffer: AudioBuffer; result: VocalTractResult }
  | { type: "error"; previousState: AppState["type"]; error: string | Error };

export type AppAction =
  | { type: "START_RECORDING" }
  | { type: "RECORDING_COMPLETE"; audioBuffer: AudioBuffer }
  | { type: "PROCESSING_COMPLETE"; result: VocalTractResult }
  | { type: "ERROR"; error: string | Error };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "START_RECORDING":
      return { type: "recording" };

    case "RECORDING_COMPLETE":
      return { type: "processing", audioBuffer: action.audioBuffer };

    case "PROCESSING_COMPLETE":
      if (state.type !== "processing") return state;
      return {
        type: "completed",
        audioBuffer: state.audioBuffer,
        result: action.result,
      };

    case "ERROR":
      return { type: "error", previousState: state.type, error: action.error };

    default:
      return state;
  }
}

export const initialState: AppState = { type: "idle" };
