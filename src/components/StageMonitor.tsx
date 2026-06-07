import React from "react";
import type { StageState } from "../types/theater";

interface StageMonitorProps {
  stageState: StageState;
}

export const StageMonitor: React.FC<StageMonitorProps> = ({ stageState }) => {
  const {
    curtainMain,
    koseri,
    curtainMiddle,
    curtainBack,
    horizone,
    actorPresent,
  } = stageState;

  // 1. ホリゾント（最奥）の色決定
  const horizoneStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: "60px",
    background: horizone.active
      ? "linear-gradient(to bottom, #2b7fff 0%, #ffcc99 80%, #ffffff 100%)"
      : "#050505",
    transition: "background 0.5s ease",
    zIndex: 1,
  };

  // 2. 小迫り（セリ）のY軸・高さの計算
  const kHeight = koseri.currentHeight;
  let seliBottom = 60;
  // 【修正】12px ➔ 12 (識別子エラーの解消)
  let seliHeight = 12;

  if (kHeight >= 0) {
    seliBottom = 60 + (kHeight / 450) * 25;
  } else {
    seliBottom = 60 + (kHeight / 1000) * 30;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "650px",
        height: "360px",
        backgroundColor: "#0a0a0a",
        border: "4px solid #222",
        position: "relative",
        overflow: "hidden",
        borderRadius: "6px",
        boxShadow: "inset 0 0 30px rgba(0,0,0,1)",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          color: "#555",
          fontSize: "10px",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        [STAGE MONITOR - COCKPIT VIEW]
      </div>

      {/* LAYER 1: 【最奥】ホリゾント幕 */}
      <div style={horizoneStyle} />

      {/* LAYER 2: 【奥から2番目】渡りの引き割幕 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${50 - curtainBack.position / 2}%`,
          height: "300px",
          backgroundColor: "#15151b",
          borderRight: "1px solid #333",
          zIndex: 2,
          transition: "width 0.1s linear",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${50 - curtainBack.position / 2}%`,
          height: "300px",
          backgroundColor: "#15151b",
          borderLeft: "1px solid #333",
          zIndex: 2,
          transition: "width 0.1s linear",
        }}
      />

      {/* LAYER 3: 【中間】中割幕 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${50 - curtainMiddle.position / 2}%`,
          height: "300px",
          backgroundColor: "#0c0c10",
          borderRight: "2px solid #222",
          zIndex: 3,
          transition: "width 0.1s linear",
          boxShadow: "5px 0 15px rgba(0,0,0,0.7)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${50 - curtainMiddle.position / 2}%`,
          height: "300px",
          backgroundColor: "#0c0c10",
          borderLeft: "2px solid #222",
          zIndex: 3,
          transition: "width 0.1s linear",
          boxShadow: "-5px 0 15px rgba(0,0,0,0.7)",
        }}
      />

      {/* LAYER 4: 【舞台面 ＆ 小迫り・役者】 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          backgroundColor: "#252729",
          borderTop: "4px solid #3d4043",
          zIndex: 4,
        }}
      >
        {kHeight < 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "140px",
              height: "40px",
              backgroundColor: "#000",
              boxShadow: "inset 0 5px 10px rgba(0,0,0,1)",
              border: "1px solid #111",
            }}
          />
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: `${seliBottom}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "130px",
          height: `${seliHeight}px`,
          backgroundColor: "#44484c",
          border: "2px solid #6c7278",
          borderRadius: "2px",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
          transition: "bottom 0.1s linear",
        }}
      >
        <span style={{ color: "#aaa", fontSize: "9px" }}>
          {kHeight === -50 ? "ぬすみ" : Math.round(kHeight) + "mm"}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: `${seliBottom + seliHeight}px`,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 5,
          pointerEvents: "none",
          transition: "bottom 0.1s linear",
        }}
      >
        {/* 【修正】actorPresent の条件を追加し、未使用警告をクリア */}
        {kHeight > -800 && actorPresent === "on-stage" && (
          <div
            style={{
              fontSize: "24px",
              filter: kHeight < 0 ? "brightness(0.3)" : "none",
              textAlign: "center",
            }}
          >
            🕺
          </div>
        )}
      </div>

      {/* LAYER 5: 【最手前】緞帳 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${100 - curtainMain.position}%`,
          backgroundColor: "#500a0a",
          borderBottom: "5px solid #ffcc00",
          boxShadow: "0 5px 15px rgba(0,0,0,0.8)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.2)",
          fontSize: "20px",
          fontWeight: "bold",
          overflow: "hidden",
        }}
      >
        {curtainMain.position < 90 && "【 緞 帳 】"}
      </div>

      {/* LAYER 6: 【コックピット】音響卓 QL5 のフレーム */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "22px",
          backgroundColor: "#111315",
          borderTop: "2px solid #2d3135",
          zIndex: 15,
          display: "flex",
          alignItems: "center",
          paddingLeft: "10px",
          color: "#777",
          fontSize: "9px",
          fontWeight: "bold",
          letterSpacing: "1px",
        }}
      >
        YAMAHA QL5 CLOCK SYNC [OK]
      </div>
    </div>
  );
};
