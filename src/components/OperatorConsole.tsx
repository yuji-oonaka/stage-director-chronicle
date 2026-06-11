// components/OperatorConsole.tsx
import React from "react";
import type { StageState, StagePhase } from "../types/theater";
import { KoseriColumn } from "./console/KoseriColumn";
import { CurtainColumn } from "./console/CurtainColumn";
import { AccessoryColumn } from "./console/AccessoryColumn";

interface OperatorConsoleProps {
  stageState: StageState;
  phase: StagePhase;
  mainCurtainMode: "vertical" | "horizontal";
  onMainCurtainModeChange: (mode: "vertical" | "horizontal") => void;
  onCurtainAction: (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    action: "開" | "閉" | "S",
  ) => void;
  onCurtainSpeedChange: (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    speed: number,
  ) => void;
  onKoseriAction: (namedPos: "+450" | "舞台" | "ぬすみ" | "奈落") => void;
  onKoseriStop: () => void;
}

export const OperatorConsole: React.FC<OperatorConsoleProps> = ({
  stageState,
  phase,
  mainCurtainMode,
  onMainCurtainModeChange,
  onCurtainAction,
  onCurtainSpeedChange,
  onKoseriAction,
  onKoseriStop,
}) => {
  const { curtainMain, curtainMiddle, curtainBack, koseri } = stageState;

  return (
    <div
      style={{
        backgroundColor: "#1c1d1f",
        border: "5px solid #2d2f31",
        borderRadius: "4px",
        padding: "25px",
        width: "100%",
        maxWidth: "850px",
        boxShadow: "0 15px 35px rgba(0,0,0,0.8)",
        fontFamily: '"MS Gothic", "Osaka", monospace',
        color: "#fff",
      }}
    >
      {/* 操作盤ヘッダーロゴ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #000",
          paddingBottom: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            letterSpacing: "2px",
            color: "#aaa",
          }}
        >
          Sankei ENGINEERING{" "}
          <span style={{ fontSize: "10px", color: "#666" }}>
            PLC-CONTROL SYSTEM
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ fontSize: "9px", color: "#666", textAlign: "center" }}>
            <div
              style={{
                width: "25px",
                height: "10px",
                backgroundColor: "#1d4225",
                border: "1px solid #000",
                margin: "0 auto 2px",
              }}
            />
            電源
          </div>
          <div style={{ fontSize: "9px", color: "#666", textAlign: "center" }}>
            <div
              style={{
                width: "25px",
                height: "10px",
                backgroundColor: "#5e1919",
                border: "1px solid #000",
                margin: "0 auto 2px",
              }}
            />
            PLC異常
          </div>
        </div>
      </div>

      {/* メイン操作マトリクス */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* COLUMN 1: 小迫り（セリ）列 */}
        <KoseriColumn
          koseri={koseri}
          onKoseriAction={onKoseriAction}
          onKoseriStop={onKoseriStop}
        />

        {/* COLUMN 2: 緞帳 列 */}
        <CurtainColumn
          title="緞帳"
          target="curtainMain"
          state={curtainMain}
          onCurtainAction={onCurtainAction}
          onCurtainSpeedChange={onCurtainSpeedChange}
        />

        {/* COLUMN 3: 中割幕 列 */}
        <CurtainColumn
          title="中割幕"
          target="curtainMiddle"
          state={curtainMiddle}
          onCurtainAction={onCurtainAction}
          onCurtainSpeedChange={onCurtainSpeedChange}
        />

        {/* COLUMN 4: 引割幕 列 */}
        <CurtainColumn
          title="引割幕"
          target="curtainBack"
          state={curtainBack}
          onCurtainAction={onCurtainAction}
          onCurtainSpeedChange={onCurtainSpeedChange}
        />

        {/* COLUMN 5: アクセサリ・スペック設定枠 */}
        <AccessoryColumn
          phase={phase}
          curtainMain={curtainMain}
          mainCurtainMode={mainCurtainMode}
          onMainCurtainModeChange={onMainCurtainModeChange}
        />
      </div>
    </div>
  );
};
