import React, { useState, useEffect, useRef } from "react";
// 【修正】型インポートであることを明示するために 'type' を追加
import type { StageState, TimelineEvent } from "../types/theater";
import timelineData from "../data/timeline.json";

const initialStageState: StageState = {
  curtain: "closed",
  koseri: "down",
  horizone: false,
  actorPresent: "none",
};

export const TheaterMaster: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [stageState, setStageState] = useState<StageState>(initialStageState);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  const timeline: TimelineEvent[] = timelineData as TimelineEvent[];

  const animate = (time: number) => {
    if (previousTimeRef.current !== null) {
      const deltaTime = time - previousTimeRef.current;
      setElapsedTime((prevTime) => prevTime + deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      previousTimeRef.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setStageState(initialStageState);
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#111",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "monospace",
      }}
    >
      <h2
        style={{
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
          color: "#00ffcc",
        }}
      >
        【主制御盤】TheaterMaster (親)
      </h2>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#222",
          borderRadius: "4px",
        }}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: isPlaying ? "#ff3333" : "#33cc33",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isPlaying ? "PAUSE (一時停止)" : "RUN (演目スタート)"}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: "10px 20px",
            backgroundColor: "#555",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          RESET (リセット)
        </button>
      </div>

      <div style={{ fontSize: "18px", color: "#aaa", marginBottom: "30px" }}>
        内部システム時間:{" "}
        <span style={{ color: "#fff", fontSize: "24px" }}>
          {(elapsedTime / 1000).toFixed(3)}
        </span>{" "}
        秒
      </div>

      {/* 【修正】stageState と timeline を仮出力して未使用エラーを回避（かつデバッグしやすく） */}
      <div
        style={{
          borderTop: "1px solid #333",
          paddingTop: "20px",
          fontSize: "12px",
          color: "#888",
        }}
      >
        <h3>🔍 デバッグモニター（変数使用化）</h3>
        <p>現在の舞台機構状態: {JSON.stringify(stageState)}</p>
        <p>読み込み済みの総キュー数: {timeline.length} 個</p>
      </div>
    </div>
  );
};
