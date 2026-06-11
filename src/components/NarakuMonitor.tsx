import React from "react";
import type { StageState } from "../types/theater";

interface NarakuMonitorProps {
  stageState: StageState;
}

export const NarakuMonitor: React.FC<NarakuMonitorProps> = ({ stageState }) => {
  const { koseri, actorPresent } = stageState;
  const height = koseri.currentHeight;

  // 0mm(上) 〜 -4000mm(下) の数値を、180pxの縦軸シャフトにマッピング
  const maxStroke = 4000;
  const shaftHeight = 180;

  // 地下への下降計算（0以上はトップ固定、マイナスは比率に応じて下へ）
  const narakuY = height >= 0 ? 0 : (height / -maxStroke) * shaftHeight;

  return (
    <div
      style={{
        width: "150px",
        height: "340px", // 三研操作盤の高さにジャストフィットさせる
        backgroundColor: "#0d1109",
        border: "4px solid #2d3824",
        borderRadius: "4px",
        padding: "12px 8px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.9)",
        fontFamily: "monospace",
        color: "#39e62e",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          borderBottom: "1px solid #2d3824",
          paddingBottom: "6px",
          marginBottom: "12px",
          textAlign: "center",
          letterSpacing: "1px",
          fontWeight: "bold",
        }}
      >
        [SUB - NARAKU]
      </div>

      {/* 2Dエレベーターシャフト断面 */}
      <div
        style={{
          flex: 1,
          borderLeft: "2px dashed #2d3824",
          borderRight: "2px dashed #2d3824",
          margin: "0 15px",
          position: "relative",
          backgroundColor: "rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        {/* 舞台面（0mm）の赤ライン */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: 0,
            right: 0,
            borderTop: "1px solid #ff3333",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: "4px",
            fontSize: "8px",
            color: "#ff3333",
            fontWeight: "bold",
          }}
        >
          STAGE(0)
        </div>

        {/* 地下4m限界線 */}
        <div
          style={{
            position: "absolute",
            top: `${shaftHeight}px`,
            left: 0,
            right: 0,
            borderTop: "1px solid #2d3824",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: `${shaftHeight + 2}px`,
            left: "4px",
            fontSize: "8px",
            color: "#555",
          }}
        >
          PIT(-4m)
        </div>

        {/* 同期昇降する役者ドット */}
        <div
          style={{
            position: "absolute",
            top: `${narakuY - 20}px`,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "16px",
            zIndex: 3,
            display: actorPresent === "on-stage" ? "block" : "none",
            transition: "transform 0.1s linear",
          }}
        >
          {height > -3500 ? "🕺" : "👤"}
        </div>

        {/* 同期昇降するセリ床グリーンエッジ */}
        <div
          style={{
            position: "absolute",
            top: `${narakuY}px`,
            left: "5%",
            width: "90%",
            height: "5px",
            backgroundColor: "#39e62e",
            border: "1px solid #000",
            zIndex: 2,
            boxShadow: "0 0 10px #33ff33",
            transition: "transform 0.1s linear",
          }}
        />
      </div>

      {/* デジタル表示カウンター */}
      <div
        style={{
          marginTop: "12px",
          padding: "8px 4px",
          backgroundColor: "rgba(0,0,0,0.7)",
          borderRadius: "3px",
          border: "1px solid #2d3824",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: "bold",
            textAlign: "center",
            letterSpacing: "0.5px",
          }}
        >
          迫り: <span style={{ color: "#fff" }}>{Math.round(height)}</span>mm
        </div>
        <div
          style={{
            fontSize: "7px",
            color: "#445533",
            marginTop: "4px",
            textAlign: "center",
          }}
        >
          PIT CAMERA #04
        </div>
      </div>
    </div>
  );
};
