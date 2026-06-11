// components/stage/BackCurtain.tsx
import React from "react";

interface BackCurtainProps {
  position: number;
}

export const BackCurtain: React.FC<BackCurtainProps> = ({ position }) => {
  const curtainBackBg =
    "linear-gradient(to right, #1a1a24 0%, #323242 25%, #101015 50%, #323242 75%, #1a1a24 100%)";
  const w = `${50 - position / 2}%`;

  return (
    <>
      {/* 左引割 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: w,
          height: "156px",
          background: curtainBackBg,
          borderRight: "1px solid #000",
          zIndex: 3,
          boxShadow: "5px 0 15px rgba(0,0,0,0.5)",
        }}
      />
      {/* 右引割 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: w,
          height: "156px",
          background: curtainBackBg,
          borderLeft: "1px solid #000",
          zIndex: 3,
          boxShadow: "-5px 0 15px rgba(0,0,0,0.5)",
        }}
      />
    </>
  );
};
