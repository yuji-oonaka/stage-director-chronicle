import React from "react";
import type { StageState } from "../types/theater";

interface StageMonitorProps {
  stageState: StageState;
}

export const StageMonitor: React.FC<StageMonitorProps> = ({ stageState }) => {
  const { curtain, koseri, horizone, actorPresent } = stageState;

  // ホリゾント（最背面）の背景色決定
  const horizoneBg = horizone ? "#0055ff" : "#050505"; // 点灯時は鮮やかな舞台ブルー、消灯時は漆黒

  // 中割幕（カーテン）の幅をステートから簡易決定（開閉アニメーションの土台）
  // 本格アニメーションは後ほど実装するため、まずはステートに応じた見た目の切り替え
  const isCurtainOpen = curtain === "open" || curtain === "opening";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        height: "300px",
        backgroundColor: "#000",
        border: "3px solid #555",
        position: "relative",
        overflow: "hidden",
        borderRadius: "4px",
        boxShadow: "inset 0 0 20px rgba(0,0,0,1)",
      }}
    >
      {/* 画面ラベル */}
      <div
        style={{
          position: "absolute",
          top: "5px",
          left: "5px",
          color: "#666",
          fontSize: "10px",
          zIndex: 10,
        }}
      >
        [STAGE MONITOR - QL5 VIEW]
      </div>

      {/* 1. 【奥 / z-index: 1】ホリゾント幕 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: horizoneBg,
          transition: "background-color 0.5s ease",
          zIndex: 1,
        }}
      />

      {/* 2. 【中二 / z-index: 2】小迫り ＆ 役者 */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          textAlign: "center",
          transition: "all 0.8s ease",
        }}
      >
        {/* 役者グラフィック（ファミコン風テキスト表現） */}
        {actorPresent === "on-stage" && (
          <div
            style={{
              color: "#fff",
              fontSize: "24px",
              marginBottom: "5px",
              textShadow: "0 0 5px #fff",
              animation: "bounce 0.5s infinite alternate",
            }}
          >
            🕺【役者】
          </div>
        )}
        {actorPresent === "haked" && (
          <div
            style={{ color: "#ff3333", fontSize: "12px", marginBottom: "5px" }}
          >
            ➔ ハケ完了
          </div>
        )}

        {/* 小迫り（ステージの昇降床） */}
        <div
          style={{
            width: "120px",
            height: koseri === "up" || koseri === "rising" ? "40px" : "10px",
            backgroundColor: "#333",
            border: "2px solid #666",
            borderRadius: "3px",
            color: "#888",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "height 0.5s ease-in-out",
            boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
          }}
        >
          小迫り ({koseri.toUpperCase()})
        </div>
      </div>

      {/* 3. 【中一 / z-index: 3】中割幕（左右に開閉する舞台幕） */}
      {/* 左幕 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: isCurtainOpen ? "10%" : "50%",
          height: "100%",
          backgroundColor: "#800000", // 深紅のベロアをイメージ
          borderRight: "2px solid #4a0000",
          transition: "width 1.5s ease-in-out",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          color: "rgba(255,255,255,0.2)",
          fontSize: "12px",
        }}
      >
        {curtain === "closed" && "幕"}
      </div>
      {/* 右幕 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: isCurtainOpen ? "10%" : "50%",
          height: "100%",
          backgroundColor: "#800000",
          borderLeft: "2px solid #4a0000",
          transition: "width 1.5s ease-in-out",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          color: "rgba(255,255,255,0.2)",
          fontSize: "12px",
        }}
      >
        {curtain === "closed" && "幕"}
      </div>

      {/* 4. 【手前 / z-index: 4】固定の緞帳（フレーム表現） */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "15px",
          backgroundColor: "#4a0000",
          zIndex: 4,
          boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
        }}
      />

      {/* CSSの簡易バウンスアニメーションを埋め込み */}
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};
