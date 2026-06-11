// components/console/KoseriColumn.tsx
import React from "react";
import type { KoseriState } from "../../types/theater";

interface KoseriColumnProps {
  koseri: KoseriState;
  onKoseriAction: (namedPos: "+450" | "舞台" | "ぬすみ" | "奈落") => void;
  onKoseriStop: () => void;
}

export const KoseriColumn: React.FC<KoseriColumnProps> = ({
  koseri,
  onKoseriAction,
  onKoseriStop,
}) => {
  const squareButtonStyle = (isActive: boolean, isStop = false) => {
    const baseColor = isStop ? "#5e1919" : "#e0e0e0";
    const activeColor = isStop ? "#ff2b2b" : "#fff";
    const textColor = isStop ? (isActive ? "#fff" : "#b88686") : "#000";

    return {
      width: "65px",
      height: "42px",
      backgroundColor: isActive ? activeColor : baseColor,
      color: textColor,
      fontSize: "12px",
      fontWeight: "bold" as const,
      border: "2px solid #000",
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
        小迫り
      </div>
      <button
        onClick={() => onKoseriAction("+450")}
        style={squareButtonStyle(koseri.targetNamedPosition === "+450")}
      >
        +450
      </button>
      <button
        onClick={() => onKoseriAction("舞台")}
        style={squareButtonStyle(koseri.targetNamedPosition === "舞台")}
      >
        舞台
      </button>
      <button
        onClick={() => onKoseriAction("ぬすみ")}
        style={squareButtonStyle(koseri.targetNamedPosition === "ぬすみ")}
      >
        ぬすみ
      </button>
      <button
        onClick={() => onKoseriAction("奈落")}
        style={squareButtonStyle(koseri.targetNamedPosition === "奈落")}
      >
        奈落
      </button>
      <button
        onClick={onKoseriStop}
        style={squareButtonStyle(
          koseri.status === "stopped" && koseri.targetNamedPosition === "none",
          true,
        )}
      >
        S
      </button>
    </div>
  );
};
