import React, { useReducer } from "react";
import "./App.css";
import {
  EstimatedGender,
  RecordingDuration,
  type EstimatedGenderValue,
} from "./contract";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useRecordAndProcess } from "./hooks/useRecordAndProcess";
import { useWorker } from "./hooks/useWorker";
import { appReducer, initialState, type AppState } from "./stores/app";

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const workerRequest = useWorker(
    `${import.meta.env.BASE_URL}/vtlib/worker.js`
  );
  const { startRecording } = useAudioRecorder();
  const handleRecordAndProcess = useRecordAndProcess(
    dispatch,
    startRecording,
    workerRequest
  );

  const isWorking = state.type === "recording" || state.type === "processing";

  return (
    <div className="app-root">
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">こえからわかるくん</div>
        </div>
      </header>

      <main className="container page-body">
        <div className="card">
          <StateLabel state={state} />

          <Body state={state}>
            <Body.IdleAction>
              <div className="instruction">
                「い」か「う」を伸ばしてマイクに向かって話してみましょう。
              </div>
              <button
                onClick={handleRecordAndProcess}
                disabled={isWorking}
                style={{ padding: "10px 20px", fontSize: "16px" }}
              >
                {RecordingDuration}秒間録音を開始
              </button>
            </Body.IdleAction>

            <Body.CompletedAction>
              <button
                onClick={handleRecordAndProcess}
                disabled={isWorking}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  fontSize: "16px",
                }}
              >
                もう一度録音する
              </button>
            </Body.CompletedAction>

            <Body.ErrorAction>
              <button
                onClick={handleRecordAndProcess}
                disabled={isWorking}
                style={{ padding: "10px 20px", fontSize: "16px" }}
              >
                最初からやり直す
              </button>
            </Body.ErrorAction>
          </Body>
        </div>
      </main>
      <footer className="site-footer">
        本アプリは Praat（GPLv3）を使用しています。対応ソース・ビルド手順:{" "}
        <a href="https://github.com/yamachu/vt2u">github.com/yamachu/vt2u</a>
      </footer>
    </div>
  );
}

const StateLabel: React.FC<{ state: AppState }> = ({ state }) => {
  switch (state.type) {
    case "idle":
      return null;
    case "recording":
      return (
        <div style={{ color: "#0066cc", marginBottom: "10px" }}>
          🎤 録音中... ({RecordingDuration}秒)
        </div>
      );
    case "processing":
      return (
        <div style={{ color: "#0066cc", marginBottom: "10px" }}>
          ⏳ 解析中です...
        </div>
      );
    case "completed":
      return (
        <div style={{ color: "#008800", marginBottom: "10px" }}>
          ✅ 解析完了!
        </div>
      );
    case "error":
      return (
        <div style={{ color: "red", marginBottom: "10px" }}>
          ❌ エラーが発生しました
        </div>
      );
    default:
      return null;
  }
};

const BodyIdleAction: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>;
};
const BodyCompletedAction: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <>{children}</>;
};
const BodyErrorAction: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <>{children}</>;
};

type BodySlots = {
  IdleAction: typeof BodyIdleAction;
  CompletedAction: typeof BodyCompletedAction;
  ErrorAction: typeof BodyErrorAction;
};

const Body: React.FC<React.PropsWithChildren<{ state: AppState }>> &
  BodySlots = ({ state, children }) => {
  const slotChildren = React.Children.toArray(children).filter(
    React.isValidElement
  );

  const idle = slotChildren.find((child) => child.type === BodyIdleAction);
  const completed = slotChildren.find(
    (child) => child.type === BodyCompletedAction
  );
  const error = slotChildren.find((child) => child.type === BodyErrorAction);

  switch (state.type) {
    case "idle":
      return <>{idle}</>;
    case "completed":
      return (
        <>
          <div style={{ marginTop: "15px", marginBottom: "15px" }}>
            <strong>声道解析結果:</strong>
            <div
              style={{
                background: "#e8f5e9",
                padding: "15px",
                marginTop: "10px",
                borderRadius: "8px",
                border: "2px solid #4caf50",
              }}
            >
              <div style={{ marginBottom: "10px" }}>
                <strong>推定性別:</strong>{" "}
                <span style={{ fontSize: "18px", color: "#2e7d32" }}>
                  {getGenderLabel(state.result.EstimatedGender)}
                </span>
              </div>
              <div>
                <strong>推定身長:</strong>{" "}
                <span style={{ fontSize: "18px", color: "#2e7d32" }}>
                  {state.result.MaleHeight.toFixed(1)} cm
                </span>
              </div>
            </div>
          </div>
          {completed}
          <div className="disclaimer">
            録音環境や話し方によっても結果は変動します。あくまでも、個人で楽しむ範囲でご利用ください。
          </div>
        </>
      );
    case "error":
      return (
        <>
          <div
            style={{
              background: "#fee",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "10px",
            }}
          >
            {state.error instanceof Error ? state.error.message : state.error}
          </div>
          {error}
        </>
      );
    default:
      return null;
  }
};
Body.IdleAction = BodyIdleAction;
Body.CompletedAction = BodyCompletedAction;
Body.ErrorAction = BodyErrorAction;

function getGenderLabel(gender: EstimatedGenderValue): string {
  switch (gender) {
    case EstimatedGender.Male:
      return "男性";
    case EstimatedGender.Female:
      return "女性";
    case EstimatedGender.MaleOrFemale:
      return "男性または女性";
    case EstimatedGender.FemaleOrMale:
      return "女性または男性";
    case EstimatedGender.Unknown:
    default:
      return "不明";
  }
}

export default App;
