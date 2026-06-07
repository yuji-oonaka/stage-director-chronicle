import React, { useState, useEffect, useRef } from "react";
import type { StageState, TimelineEvent } from "../types/theater";
import timelineData from "../data/timeline.json";
import { SeikoClock } from "./SeikoClock";
import { StageMonitor } from "./StageMonitor";
// 【追加】操作盤のインポート
import { OperatorConsole } from "./OperatorConsole";

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

  // 【将来への布石】自動進行処理（ブザーが鳴る、役者が勝手に板付くなどの環境変化用）
  useEffect(() => {
    if (!isPlaying) return;

    // 開演ブザー（0秒）の自動シミュレート
    if (
      elapsedTime >= 0 &&
      stageState.actorPresent === "none" &&
      stageState.curtain === "closed"
    ) {
      // 最初の状態トリガー（ここでは役者をスタンバイさせるなど）
      setStageState((prev) => ({ ...prev, actorPresent: "none" }));
    }

    // 14秒時点で役者が勝手に裏でスタンバイ（板付き準備）する等のタイムライン自動進行
    if (
      elapsedTime >= 14000 &&
      elapsedTime < 15000 &&
      stageState.actorPresent === "none"
    ) {
      setStageState((prev) => ({ ...prev, actorPresent: "on-stage" })); // 15秒の迫り上がりに向けて役者が板付く
    }
  }, [elapsedTime, isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setStageState(initialStageState);
  };

  // 【追加】中割幕ボタンが押された時の処理
  const handleCurtainAction = (action: "開" | "閉" | "S") => {
    console.log(
      `[CUE] 中割幕操作: ${action} (Time: ${(elapsedTime / 1000).toFixed(3)}s)`,
    );

    setStageState((prev) => {
      let nextCurtain: StageState["curtain"] = prev.curtain;
      let nextHorizone = prev.horizone;

      if (action === "開") {
        nextCurtain = "open";
        nextHorizone = true; // 仕様書より：中割幕【開】/ ホリゾント点灯
      } else if (action === "閉") {
        nextCurtain = "closed";
      } else if (action === "S") {
        nextCurtain = "stopped";
      }

      return { ...prev, curtain: nextCurtain, horizone: nextHorizone };
    });
  };

  // 【追加】小迫りボタンが押された時の処理
  const handleKoseriAction = (action: "昇" | "降" | "S") => {
    console.log(
      `[CUE] 小迫り操作: ${action} (Time: ${(elapsedTime / 1000).toFixed(3)}s)`,
    );

    setStageState((prev) => {
      let nextKoseri: StageState["koseri"] = prev.koseri;

      if (action === "昇") nextKoseri = "up";
      if (action === "降") nextKoseri = "down";
      if (action === "S") nextKoseri = "stopped";

      return { ...prev, koseri: nextKoseri };
    });
  };

  // 【追加】演出同期 GO ボタンが押された時の処理
  const handleSynchroGO = () => {
    console.log(
      `[CUE] 音響・照明 GO! (Time: ${(elapsedTime / 1000).toFixed(3)}s)`,
    );

    setStageState((prev) => ({
      ...prev,
      actorPresent:
        prev.actorPresent === "on-stage" ? "haked" : prev.actorPresent,
    }));
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

      {/* モニターセクション */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3 style={{ fontSize: "14px", color: "#888", marginBottom: "5px" }}>
            ⏱ 調整室モニター（子）
          </h3>
          <SeikoClock elapsedTime={elapsedTime} isPlaying={isPlaying} />
        </div>

        <div style={{ flex: "1", minWidth: "300px" }}>
          <h3 style={{ fontSize: "14px", color: "#888", marginBottom: "5px" }}>
            🎬 舞台目視モニター（子）
          </h3>
          <StageMonitor stageState={stageState} />
        </div>
      </div>

      {/* 【追加】操作盤盤面セクション */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ fontSize: "14px", color: "#888", marginBottom: "5px" }}>
          🎛 下手舞台袖操作盤（子）
        </h3>
        <OperatorConsole
          onCurtainAction={handleCurtainAction}
          onKoseriAction={handleKoseriAction}
          onSynchroGO={handleSynchroGO}
        />
      </div>

      <div
        style={{
          borderTop: "1px solid #333",
          paddingTop: "20px",
          fontSize: "12px",
          color: "#888",
        }}
      >
        <h3>🔍 デバッグモニター</h3>
        <p>現在の舞台機構状態: {JSON.stringify(stageState)}</p>
        <p>読み込み済みの総キュー数: {timeline.length} 個</p>
      </div>
    </div>
  );
};
