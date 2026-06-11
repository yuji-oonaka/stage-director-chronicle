// components/StageMonitor.tsx
import React from "react";
import type { StageState } from "../types/theater";
import { MainCurtain } from "./stage/MainCurtain";
import { MiddleCurtain } from "./stage/MiddleCurtain";
import { BackCurtain } from "./stage/BackCurtain";
import { Koseri } from "./stage/Koseri";
import { TikkouDots } from "./stage/TikkouDots";

interface StageMonitorProps {
  stageState: StageState;
  mainCurtainMode: "vertical" | "horizontal";
}

export const StageMonitor: React.FC<StageMonitorProps> = ({
  stageState,
  mainCurtainMode,
}) => {
  const {
    curtainMain,
    koseri,
    curtainMiddle,
    curtainBack,
    horizone,
    actorPresent,
  } = stageState;

  const horizoneBg = horizone.active
    ? "linear-gradient(to bottom, #1a66ff 0%, #ffb366 70%, #ffffff 100%)"
    : "#111";

  return (
    <div
      style={{
        display: "flex",
        gap: "15px",
        alignItems: "flex-start",
        maxWidth: "820px",
        width: "100%",
      }}
    >
      {/* 🎬 MAIN PORT 1: 本舞台目視モニター */}
      <div
        style={{
          flex: 1,
          height: "380px",
          backgroundColor: "#020202",
          border: "4px solid #222",
          position: "relative",
          overflow: "hidden",
          borderRadius: "6px",
          boxShadow: "inset 0 0 40px rgba(0,0,0,1)",
          fontFamily: "monospace",
          perspective: "500px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            color: "#666",
            fontSize: "10px",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          [STAGE 3D MONITOR - QL5 VIEW]
        </div>

        {/* LAYER 1: 最奥ホリゾント幕 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "240px",
            background: horizoneBg,
            transition: "background 0.5s ease",
            zIndex: 1,
          }}
        />

        {/* LAYER 2: 渡り高台 */}
        <div
          style={{
            position: "absolute",
            top: "140px",
            left: 0,
            right: 0,
            height: "20px",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "16px",
              background: "linear-gradient(to bottom, #ffffff, #dcdcdc)",
              borderBottom: "2px solid #555",
            }}
          />
        </div>

        {/* LAYER 3: 階段幕（引割） */}
        <BackCurtain position={curtainBack.position} />

        {/* LAYER 4: 全面ワイド大階段 */}
        <div
          style={{
            position: "absolute",
            top: "156px",
            left: 0,
            right: 0,
            height: "100px",
            zIndex: 4,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {[14, 16, 18, 20].map((h, i) => (
              <div
                key={i}
                style={{
                  height: `${h}px`,
                  background:
                    "linear-gradient(to bottom, #ffffff 0%, #d8d8d8 30%, #666 35%, #1a1a1a 100%)",
                  borderTop: "1px solid #fff",
                  borderBottom: "1px solid #222",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.5)",
                  zIndex: i,
                }}
              />
            ))}
          </div>
        </div>

        {/* LAYER 5: 中割幕 */}
        <MiddleCurtain position={curtainMiddle.position} />

        {/* LAYER 6: 本舞台の光沢床面 */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "-50px",
            right: "-50px",
            height: "140px",
            background:
              "linear-gradient(to bottom, #e5e5e5 0%, #f9f9f9 25%, #c0c0c0 100%)",
            borderTop: "3px solid #fff",
            zIndex: 10,
            transform: "rotateX(25deg)",
            transformOrigin: "top center",
            boxShadow: "0 -10px 20px rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        />

        <TikkouDots />

        {/* LAYER 7: 小迫りユニット（奈落大穴・昇降台座・役者を含む） */}
        <Koseri
          currentHeight={koseri.currentHeight}
          targetNamedPosition={koseri.targetNamedPosition}
          actorPresent={actorPresent}
        />

        {/* LAYER 20: 最手前・上下緞帳 */}
        <MainCurtain position={curtainMain.position} mode={mainCurtainMode} />

        {/* LAYER 30: YAMAHA QL5 メーターフレーム */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "22px",
            backgroundColor: "#111315",
            borderTop: "2px solid #2d3135",
            zIndex: 30,
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
    </div>
  );
};
