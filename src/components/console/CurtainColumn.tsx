// components/console/CurtainColumn.tsx
import React from "react";
import type { CurtainState } from "../../types/theater";

interface CurtainColumnProps {
  title: string;
  target: "curtainMain" | "curtainMiddle" | "curtainBack";
  state: CurtainState;
  onCurtainAction: (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    action: "開" | "閉" | "S",
  ) => void;
  onCurtainSpeedChange: (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    speed: number,
  ) => void;
}

export const CurtainColumn: React.FC<CurtainColumnProps> = ({
  title,
  target,
  state,
  onCurtainAction,
  onCurtainSpeedChange,
}) => {
  const speeds = [10, 30, 50, 80, 100];

  const squareButtonStyle = (type: "開" | "閉" | "S", isActive: boolean) => {
    let baseColor = "#e0e0e0";
    let activeColor = "#fff";
    let textColor = "#000";

    if (type === "開") {
      baseColor = "#1d4225";
      activeColor = "#39e662";
      textColor = isActive ? "#000" : "#8fa895";
    } else if (type === "S") {
      baseColor = "#5e1919";
      activeColor = "#ff2b2b";
      textColor = isActive ? "#fff" : "#b88686";
    }

    return {
      width: "65px",
      height: "42px",
      backgroundColor: isActive ? activeColor : baseColor,
      color: textColor,
      fontSize: "12px",
      fontWeight: "bold" as const,
      border: "2px solid #000",
      boxShadow: isActive
        ? "0 0 12px #39e662, inset 0 0 6px rgba(255,255,255,0.8)"
        : "2px 2px 3px rgba(0,0,0,0.5)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        backgroundColor: "#25272a",
        padding: "15px 10px",
        borderRadius: "4px",
        border: "1px solid #333",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          color: "#000",
          padding: "3px 8px",
          fontSize: "12px",
          fontWeight: "bold",
          border: "1px solid #000",
          borderRadius: "2px",
          textAlign: "center",
          minWidth: "70px",
        }}
      >
        {title}
      </div>
      <button
        onClick={() => onCurtainAction(target, "開")}
        style={squareButtonStyle("開", state.status === "opening")}
      >
        開
      </button>
      <button
        onClick={() => onCurtainAction(target, "閉")}
        style={squareButtonStyle("閉", state.status === "closing")}
      >
        閉
      </button>
      <button
        onClick={() => onCurtainAction(target, "S")}
        style={squareButtonStyle("S", state.status === "stopped")}
      >
        S
      </button>

      <div style={{ marginTop: "8px", textAlign: "center" }}>
        <div style={{ fontSize: "9px", color: "#888", marginBottom: "4px" }}>
          速度(%)
        </div>
        <select
          value={state.speedDial}
          onChange={(e) => onCurtainSpeedChange(target, Number(e.target.value))}
          style={{
            backgroundColor: "#111",
            color: "#00ff00",
            border: "1px solid #555",
            fontSize: "11px",
            padding: "2px",
            fontFamily: "monospace",
          }}
        >
          {speeds.map((s) => (
            <option key={s} value={s}>
              {s}%
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
