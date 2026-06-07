import React from "react";
import type { StageState } from "../types/theater";

interface OperatorConsoleProps {
  stageState: StageState;
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
  onCurtainAction,
  onCurtainSpeedChange,
  onKoseriAction,
  onKoseriStop,
}) => {
  const { curtainMain, curtainMiddle, curtainBack, koseri } = stageState;

  // --- 三研工業パーツのCSSエミュレート ---
  const panelStyle = {
    backgroundColor: "#1c1d1f", // 黒い梨地のスチール合金
    border: "5px solid #2d2f31",
    borderRadius: "4px",
    padding: "25px",
    width: "100%",
    maxWidth: "850px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.8)",
    fontFamily: '"MS Gothic", "Osaka", monospace',
    color: "#fff",
  };

  // 銘板ラベル（白枠に黒文字のプラスチックプレート）
  const nameplateStyle = {
    backgroundColor: "#fff",
    color: "#000",
    padding: "3px 8px",
    fontSize: "12px",
    fontWeight: "bold" as const,
    border: "1px solid #000",
    borderRadius: "2px",
    textAlign: "center" as const,
    minWidth: "70px",
    display: "inline-block",
  };

  // 四角い照光式樹脂ボタン
  const squareButtonStyle = (
    type: "開" | "閉" | "S" | "位置",
    isActive: boolean,
  ) => {
    let baseColor = "#e0e0e0"; // 未点灯の白樹脂
    let activeColor = "#fff";
    let textColor = "#000";

    if (type === "開") {
      baseColor = "#1d4225"; // 消灯時の深緑
      activeColor = "#39e662"; // 点灯時の鮮烈な黄緑LED
      textColor = isActive ? "#000" : "#8fa895";
    } else if (type === "S") {
      baseColor = "#5e1919"; // 消灯時の暗赤
      activeColor = "#ff2b2b"; // 点灯時の緊急赤LED
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
        ? `0 0 12px ${activeColor}, inset 0 0 6px rgba(255,255,255,0.8)`
        : "2px 2px 3px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.3)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.1s ease",
      transform: isActive ? "translateY(1px)" : "none",
    };
  };

  // 幕の操作列を生成する汎用レンダラー
  const renderCurtainColumn = (
    title: string,
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    state: typeof curtainMain,
  ) => {
    const speeds = [10, 30, 50, 80, 100];
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
        <div style={nameplateStyle}>{title}</div>

        {/* 操作ボタン群 */}
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

        {/* 速度インバーターダイヤル（簡易トグル式セレクターとして再現） */}
        <div style={{ marginTop: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "9px", color: "#888", marginBottom: "4px" }}>
            速度(%)
          </div>
          <select
            value={state.speedDial}
            onChange={(e) =>
              onCurtainSpeedChange(target, Number(e.target.value))
            }
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

  return (
    <div style={panelStyle}>
      {/* 操作盤ヘッダーロゴ（写真中央下のSanken ENGINEERINGロゴを完全意識） */}
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
        {/* 写真右上のPLC異常・電源ランプのインジケーター */}
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
          <div style={nameplateStyle}>小迫り</div>
          <button
            onClick={() => onKoseriAction("+450")}
            style={squareButtonStyle(
              "位置",
              koseri.targetNamedPosition === "+450",
            )}
          >
            +450
          </button>
          <button
            onClick={() => onKoseriAction("舞台")}
            style={squareButtonStyle(
              "位置",
              koseri.targetNamedPosition === "舞台",
            )}
          >
            舞台
          </button>
          <button
            onClick={() => onKoseriAction("ぬすみ")}
            style={squareButtonStyle(
              "位置",
              koseri.targetNamedPosition === "ぬすみ",
            )}
          >
            ぬすみ
          </button>
          <button
            onClick={() => onKoseriAction("奈落")}
            style={squareButtonStyle(
              "位置",
              koseri.targetNamedPosition === "奈落",
            )}
          >
            奈落
          </button>
          <button
            onClick={onKoseriStop}
            style={squareButtonStyle(
              "S",
              koseri.status === "stopped" &&
                koseri.targetNamedPosition === "none",
            )}
          >
            S
          </button>
        </div>

        {/* COLUMN 2: 緞帳 列 */}
        {renderCurtainColumn("緞帳", "curtainMain", curtainMain)}

        {/* COLUMN 3: 中割幕 列 */}
        {renderCurtainColumn("中割幕", "curtainMiddle", curtainMiddle)}

        {/* COLUMN 4: 引割緞帳（渡りの引き割幕） 列 */}
        {renderCurtainColumn("引割緞帳", "curtainBack", curtainBack)}

        {/* COLUMN 5: 写真右側のアクセサリ（キースイッチ・非常停止ボタン・テプラ） */}
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
          {/* 写真左下の伝説のピンクのテプラ「ウェイト」 */}
          <div
            style={{
              backgroundColor: "#ffb6c1",
              color: "#ff007f",
              border: "1px dashed #ff007f",
              padding: "5px",
              fontSize: "11px",
              fontWeight: "bold",
              textAlign: "center",
              boxShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              transform: "rotate(-1deg)",
            }}
          >
            ピンクテプラ：ウェイト
          </div>

          {/* 右真ん中の鍵（OFF / ON）スイッチのイミテーション */}
          <div
            style={{
              textAlign: "center",
              border: "1px solid #333",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#111",
            }}
          >
            <div
              style={{ fontSize: "9px", color: "#666", marginBottom: "4px" }}
            >
              操作切替鍵
            </div>
            <div
              style={{ color: "#aaa", fontSize: "12px", fontWeight: "bold" }}
            >
              🔑 [ON]
            </div>
          </div>

          {/* 右下の超巨大な赤いキノコ型「非常停止」ボタン */}
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
                boxShadow:
                  "0 5px 10px rgba(0,0,0,0.5), inset 0 4px 4px rgba(255,255,255,0.4)",
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
      </div>
    </div>
  );
};
