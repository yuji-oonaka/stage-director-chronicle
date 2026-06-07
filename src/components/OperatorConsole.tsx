import React from "react";

interface OperatorConsoleProps {
  onCurtainAction: (action: "開" | "閉" | "S") => void;
  onKoseriAction: (action: "昇" | "降" | "S") => void;
  onSynchroGO: () => void; // 音響・照明のGOキュー用
}

export const OperatorConsole: React.FC<OperatorConsoleProps> = ({
  onCurtainAction,
  onKoseriAction,
  onSynchroGO,
}) => {
  // 工業用ボタンの共通スタイル
  const buttonStyle = (bgColor: string) => ({
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold" as const,
    color: "#fff",
    backgroundColor: bgColor,
    border: "3px solid #333",
    borderBottomColor: "#111",
    borderRightColor: "#111",
    borderRadius: "4px",
    cursor: "pointer",
    boxShadow: "2px 2px 5px rgba(0,0,0,0.5)",
    active: {
      transform: "translateY(2px)",
      boxShadow: "none",
    },
  });

  return (
    <div
      style={{
        backgroundColor: "#3a3d40", // 工業製品っぽいグレー
        border: "4px solid #222",
        borderRadius: "6px",
        padding: "20px",
        width: "100%",
        maxWidth: "600px",
        boxShadow: "0 10px 20px rgba(0,0,0,0.6)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          color: "#ccc",
          fontSize: "11px",
          marginBottom: "15px",
          borderBottom: "2px solid #222",
          paddingBottom: "5px",
          fontWeight: "bold",
        }}
      >
        三研工業型 機構操作盤 (OPERATOR CONSOLE)
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* 中割幕セクション */}
        <div
          style={{
            backgroundColor: "#2b2d2f",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #555",
          }}
        >
          <div
            style={{
              color: "#fff",
              fontSize: "13px",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            ■ 中割幕操作 (STAGE CURTAIN)
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => onCurtainAction("開")}
              style={buttonStyle("#28a745")}
            >
              開 (OPEN)
            </button>
            <button
              onClick={() => onCurtainAction("閉")}
              style={buttonStyle("#dc3545")}
            >
              閉 (CLOSE)
            </button>
            <button
              onClick={() => onCurtainAction("S")}
              style={buttonStyle("#ffc107")}
            >
              S (STOP)
            </button>
          </div>
        </div>

        {/* 小迫りセクション */}
        <div
          style={{
            backgroundColor: "#2b2d2f",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #555",
          }}
        >
          <div
            style={{
              color: "#fff",
              fontSize: "13px",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            ■ 小迫り昇降 (STAGE ELEVATOR)
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => onKoseriAction("昇")}
              style={buttonStyle("#007bff")}
            >
              昇 (UP)
            </button>
            <button
              onClick={() => onKoseriAction("降")}
              style={buttonStyle("#6c757d")}
            >
              降 (DOWN)
            </button>
            <button
              onClick={() => onKoseriAction("S")}
              style={buttonStyle("#ffc107")}
            >
              S (STOP)
            </button>
          </div>
        </div>

        {/* 音響・照明同期 GO ボタン */}
        <div
          style={{
            backgroundColor: "#2b2d2f",
            padding: "12px",
            borderRadius: "4px",
            border: "1px solid #555",
          }}
        >
          <div
            style={{
              color: "#fff",
              fontSize: "13px",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            ■ 演出同期 (CUE SYSTEM)
          </div>
          <button
            onClick={onSynchroGO}
            style={{
              ...buttonStyle("#e0a800"),
              color: "#000",
              width: "100%",
              fontSize: "20px",
              padding: "15px",
              border: "4px solid #ad8100",
            }}
          >
            🔴 GO
          </button>
        </div>
      </div>
    </div>
  );
};
