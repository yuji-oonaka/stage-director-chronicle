import React from "react";

interface MainCurtainProps {
  position: number; // 0 (閉) 〜 100 (開)
  mode: "vertical" | "horizontal"; // 駆動方式の設定
}

export const MainCurtain: React.FC<MainCurtainProps> = ({ position, mode }) => {
  const curtainMainBg =
    "linear-gradient(to right, #400 0%, #800 25%, #300 50%, #800 75%, #400 100%)";

  // 横開き（引割）モードの描画
  if (mode === "horizontal") {
    const w = `${50 - position / 2}%`; // 左右から中央へ閉まる幅
    return (
      <>
        {/* 左側緞帳 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: w,
            height: "100%",
            background: curtainMainBg,
            borderRight: "3px solid #d4af37",
            boxShadow: "15px 0 30px rgba(0,0,0,0.9)",
            zIndex: 20,
          }}
        />
        {/* 右側緞帳 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: w,
            height: "100%",
            background: curtainMainBg,
            borderLeft: "3px solid #d4af37",
            boxShadow: "-15px 0 30px rgba(0,0,0,0.9)",
            zIndex: 20,
          }}
        />
      </>
    );
  }

  // 縦開き（上下昇降）モードの描画
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: `${100 - position}%`, // 上から下へ閉まる高さ
        background: curtainMainBg,
        borderBottom: "6px solid #d4af37",
        boxShadow: "0 12px 30px rgba(0,0,0,0.9)",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    />
  );
};
