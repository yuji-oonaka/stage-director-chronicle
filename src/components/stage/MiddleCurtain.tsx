// components/stage/MiddleCurtain.tsx
import React from "react";

interface MiddleCurtainProps {
  position: number; // 0 (閉) 〜 100 (開)
}

export const MiddleCurtain: React.FC<MiddleCurtainProps> = ({ position }) => {
  const curtainMiddleBg =
    "linear-gradient(to right, #050608 0%, #15181f 25%, #020203 50%, #15181f 75%, #050608 100%)";
  const w = `${50 - position / 2}%`; // 左右それぞれ50%から開度に応じて縮む

  return (
    <>
      {/* 左中割幕 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: w,
          height: "100%",
          background: curtainMiddleBg,
          borderRight: "2px solid #111",
          zIndex: 5,
          boxShadow: "15px 0 25px rgba(0,0,0,0.9)",
        }}
      />
      {/* 右中割幕 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: w,
          height: "100%",
          background: curtainMiddleBg,
          borderLeft: "2px solid #111",
          zIndex: 5,
          boxShadow: "-15px 0 25px rgba(0,0,0,0.9)",
        }}
      />
    </>
  );
};
