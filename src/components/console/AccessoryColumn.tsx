// components/console/AccessoryColumn.tsx
import React from "react";
import type { StagePhase, CurtainState } from "../../types/theater";

interface AccessoryColumnProps {
  phase: StagePhase;
  curtainMain: CurtainState;
  mainCurtainMode: "vertical" | "horizontal";
  onMainCurtainModeChange: (mode: "vertical" | "horizontal") => void;
}

export const AccessoryColumn: React.FC<AccessoryColumnProps> = ({
  phase,
  curtainMain,
  mainCurtainMode,
  onMainCurtainModeChange,
}) => {
  // 💡 条件を修正：「仕込みフェーズじゃないとき」または「緞帳が【開閉動作中】のとき」だけロック
  const isModeLock =
    phase !== "SETTING" ||
    curtainMain.status === "opening" ||
    curtainMain.status === "closing";

  const btnStyle = (isActive: boolean) => ({
    width: "48px",
    height: "32px",
    fontSize: "12px",
    fontWeight: "bold" as const,
    border: "2px solid #000",
    backgroundColor: isActive ? "#fff" : "#e0e0e0",
    color: "#000",
    cursor: isModeLock ? "not-allowed" : "pointer",
  });

  return (
    <div
      style={{
        flex: 1,
        minWidth: "150px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "320px",
        paddingLeft: "15px",
      }}
    >
      {/* ピンクのテプラ */}
      <div
        style={{
          backgroundColor: "#ffb6c1",
          color: "#ff007f",
          border: "1px dashed #ff007f",
          padding: "5px",
          fontSize: "11px",
          fontWeight: "bold",
          textAlign: "center",
          transform: "rotate(-1deg)",
        }}
      >
        ピンクテプラ：ウェイト
      </div>

      {/* 🔒 緞帳設定スイッチ */}
      <div
        style={{
          border: "1px solid #333",
          padding: "8px 4px",
          borderRadius: "4px",
          backgroundColor: "#111",
          textAlign: "center",
          opacity: isModeLock ? 0.5 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: isModeLock ? "#555" : "#888",
            marginBottom: "6px",
          }}
        >
          緞帳駆動方式設定 {isModeLock && "🔒"}
        </div>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          <button
            disabled={isModeLock}
            onClick={() => onMainCurtainModeChange("vertical")}
            style={btnStyle(mainCurtainMode === "vertical")}
          >
            縦
          </button>
          <button
            disabled={isModeLock}
            onClick={() => onMainCurtainModeChange("horizontal")}
            style={btnStyle(mainCurtainMode === "horizontal")}
          >
            横
          </button>
        </div>
      </div>

      {/* 鍵スイッチ */}
      <div
        style={{
          textAlign: "center",
          border: "1px solid #333",
          padding: "8px",
          borderRadius: "4px",
          backgroundColor: "#111",
        }}
      >
        <div style={{ fontSize: "9px", color: "#666", marginBottom: "4px" }}>
          操作切替鍵
        </div>
        <div style={{ color: "#aaa", fontSize: "12px", fontWeight: "bold" }}>
          🔑 [ON]
        </div>
      </div>

      {/* 非常停止 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "55px",
            height: "55px",
            backgroundColor: "#dc3545",
            borderRadius: "50%",
            border: "4px solid #ffc107",
            cursor: "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          EMERGENCY
        </div>
        <span style={{ fontSize: "9px", color: "#666", marginTop: "4px" }}>
          非常停止
        </span>
      </div>
    </div>
  );
};
