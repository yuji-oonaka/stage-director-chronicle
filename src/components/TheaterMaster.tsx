// components/TheaterMaster.tsx
import { useState, useEffect, useRef } from "react";
import type { StageState, CurtainState, StagePhase } from "../types/theater";
import timelineData from "../data/timeline.json";
import { SeikoClock } from "./SeikoClock";
import { StageMonitor } from "./StageMonitor";
import { OperatorConsole } from "./OperatorConsole";
import { NarakuMonitor } from "./NarakuMonitor";
import { calculateNextStageState } from "../utils/stagePhysics"; // 上記の物理関数をインポート

const createDefaultCurtain = (): CurtainState => ({
  position: 100,
  status: "open",
  speedDial: 100,
});

const initialStageState: StageState = {
  curtainMain: createDefaultCurtain(),
  koseri: { currentHeight: 0, status: "stopped", targetNamedPosition: "舞台" },
  curtainMiddle: createDefaultCurtain(),
  curtainBack: createDefaultCurtain(),
  horizone: { active: true, color: "#ffffff" },
  actorPresent: "none",
};

export const TheaterMaster: React.FC = () => {
  const [phase, setPhase] = useState<StagePhase>("SETTING");
  const [mainCurtainMode, setMainCurtainMode] = useState<
    "vertical" | "horizontal"
  >("vertical");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [stageState, setStageState] = useState<StageState>(initialStageState);
  

  // 精密タイマーのための参照系オブジェクト（rAFループを一度も壊さないための防壁）
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // 常に最新のReact状態をrAFループ内にノータイムで中継するためのRef
  const loopStateRef = useRef({ phase, isPlaying });
  loopStateRef.current = { phase, isPlaying };

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = time - previousTimeRef.current;
        const current = loopStateRef.current;

        // 本番中かつ再生中のみ、ストップウォッチの時間を進める
        if (current.phase === "PERFORMANCE" && current.isPlaying) {
          setElapsedTime((prev) => prev + deltaTime);
        }

        // 外部に隔離したピュアな物理演算関数を呼び出し、必要なときだけStateを更新する
        setStageState((prev) => {
          const { nextState, isChanged } = calculateNextStageState(
            prev,
            deltaTime,
          );
          return isChanged ? nextState : prev;
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    // 初回マウント時に「一度だけ」ループを起動。これ以降、フェーズ変更等でループは絶対に壊れない
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // 依存配列は空！不滅のタイマーループ

  // --- 進行管理・操作盤からのイベントハンドラー（変更なし） ---
  const handlePhaseChange = (nextPhase: StagePhase) => {
    setPhase(nextPhase);
    if (nextPhase !== "PERFORMANCE") setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setStageState(initialStageState);
    setPhase("SETTING");
  };

  const triggerCurtain = (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    action: "開" | "閉" | "S",
  ) => {
    setStageState((prev) => {
      const curtain = prev[target];
      let stat = curtain.status;
      if (action === "開") stat = "opening";
      if (action === "閉") stat = "closing";
      if (action === "S") stat = "stopped";
      return { ...prev, [target]: { ...curtain, status: stat } };
    });
  };

  const changeCurtainSpeed = (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    speed: number,
  ) => {
    setStageState((prev) => ({
      ...prev,
      [target]: { ...prev[target], speedDial: speed },
    }));
  };

  const triggerKoseri = (namedPos: "+450" | "舞台" | "ぬすみ" | "奈落") => {
    setStageState((prev) => {
      const current = prev.koseri.currentHeight;
      let target = current;
      if (namedPos === "+450") target = 450;
      if (namedPos === "舞台") target = 0;
      if (namedPos === "ぬすみ") target = -50;
      if (namedPos === "奈落") target = -4000;
      const stat =
        target > current ? "rising" : target < current ? "falling" : "stopped";
      return {
        ...prev,
        koseri: { ...prev.koseri, targetNamedPosition: namedPos, status: stat },
      };
    });
  };

  const stopKoseri = () => {
    setStageState((prev) => ({
      ...prev,
      koseri: {
        ...prev.koseri,
        status: "stopped",
        targetNamedPosition: "none",
      },
    }));
  };

  return (
    <div
      style={{
        padding: "15px",
        backgroundColor: "#111",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "monospace",
      }}
    >
      {/* 興行進行管理マネージャー UI */}
      <div
        style={{
          padding: "12px",
          backgroundColor: "#222",
          borderRadius: "4px",
          borderLeft: "5px solid #00ffcc",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#00ffcc" }}>
          📋 興行進行タイムライン（フェーズ切替）
        </h3>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "10px",
          }}
        >
          {(
            [
              "SETTING",
              "DOORS_OPEN",
              "PERFORMANCE",
              "INTERMISSION",
              "POST_SHOW",
              "EXIT",
            ] as StagePhase[]
          ).map((p) => (
            <button
              key={p}
              onClick={() => handlePhaseChange(p)}
              style={{
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: "bold",
                backgroundColor: phase === p ? "#00ffcc" : "#333",
                color: phase === p ? "#000" : "#ccc",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              {p === "SETTING" && "1.仕込み(SETTING)"}
              {p === "DOORS_OPEN" && "2.開場(客入れ)"}
              {p === "PERFORMANCE" && "3.本番(PERFORMANCE)"}
              {p === "INTERMISSION" && "4.幕間(転換)"}
              {p === "POST_SHOW" && "5.終演(バラシ)"}
              {p === "EXIT" && "6.客だし"}
            </button>
          ))}
          <button
            onClick={handleReset}
            style={{
              padding: "6px 10px",
              backgroundColor: "#555",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            RESET
          </button>
        </div>

        {phase === "PERFORMANCE" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              backgroundColor: "#111",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ff3333",
            }}
          >
            <span
              style={{ color: "#ff3333", fontWeight: "bold", fontSize: "11px" }}
            >
              ⚠️ 本番タイムライン駆動：
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                padding: "6px 15px",
                backgroundColor: isPlaying ? "#ff3333" : "#33cc33",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                borderRadius: "3px",
                fontSize: "11px",
              }}
            >
              {isPlaying
                ? "⏱ STOPWATCH PAUSE"
                : "🚀 開演ブザー ➔ タイマースタート"}
            </button>
          </div>
        )}
      </div>

      {/* モニター配置セクション */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "15px",
        }}
      >
        <SeikoClock
          elapsedTime={elapsedTime}
          isPlaying={isPlaying && phase === "PERFORMANCE"}
        />
        <div style={{ flex: "1", minWidth: "320px" }}>
          <StageMonitor
            stageState={stageState}
            mainCurtainMode={mainCurtainMode}
          />
        </div>
      </div>

      {/* コクピットセクション */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1", minWidth: "400px" }}>
          <OperatorConsole
            stageState={stageState}
            phase={phase}
            mainCurtainMode={mainCurtainMode}
            onMainCurtainModeChange={setMainCurtainMode}
            onCurtainAction={triggerCurtain}
            onCurtainSpeedChange={changeCurtainSpeed}
            onKoseriAction={triggerKoseri}
            onKoseriStop={stopKoseri}
          />
        </div>
        <NarakuMonitor stageState={stageState} />
      </div>

      {/* 数値デバッグカウンター */}
      <div
        style={{
          borderTop: "1px solid #333",
          paddingTop: "15px",
          fontSize: "12px",
          color: "#00ff00",
          lineHeight: "1.5",
          marginTop: "15px",
        }}
      >
        <div>
          🎬 緞帳: {stageState.curtainMain.position.toFixed(1)}% | 中割:{" "}
          {stageState.curtainMiddle.position.toFixed(1)}% | 引割:{" "}
          {stageState.curtainBack.position.toFixed(1)}% | 🏗 迫り:{" "}
          {Math.round(stageState.koseri.currentHeight)}mm
        </div>
        <div style={{ color: "#666", fontSize: "11px", marginTop: "4px" }}>
          📁 総演出キュー数: {timelineData.length} 個 | System確認:{" "}
          {typeof changeCurtainSpeed}
        </div>
      </div>
    </div>
  );
};
