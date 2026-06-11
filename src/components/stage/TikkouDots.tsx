// components/stage/TikkouDots.tsx
import React from "react";

interface TikkouDotsProps {}

export const TikkouDots: React.FC<TikkouDotsProps> = () => {
  // 蓄光の点の基本スタイル
  const dotBaseStyle: React.CSSProperties = {
    position: "absolute",
    width: "4px",
    height: "4px",
    backgroundColor: "#adff2f", // 現場でおなじみの蛍光グリーン
    borderRadius: "50%",
    transform: "translateX(-50%)",
    boxShadow: "0 0 10px #adff2f, 0 0 4px #fff", // 蓄光の発光表現
    opacity: 0.9, // ほんの少し透けさせる
  };

  // 「端から端まで」を表現するため、ドット数を大幅に増やす
  const numDots = 19; // センター（0番）中心に左右に9個ずつ、計19個

  // 通り（行）の定義。パースとzIndexを適正化
  const targetRows = [
    {
      bottom: "35px", // セリ前通り（一番手前）
      dotInterval: 50, // 1間のドット間隔（センター基準）
      dotSize: 4, // ドットの大きさ
      dotBrightness: 1, // ドットの明るさ（不透明度）
      zIndex: 11,
      label: "セリ前通り",
    },
    {
      bottom: "165px", // セリ後ろ、階段前通り（中段）
      dotInterval: 40, // パースに合わせて間隔を狭く
      dotSize: 3.5, // ドットを少し小さく
      dotBrightness: 0.8, // ドットを少し暗く
      zIndex: 4,
      label: "セリ後ろ通り",
    },
    {
      bottom: "235px", // 階段の上通り（一番奥）
      dotInterval: 30, // 間隔をさらに狭く
      dotSize: 3, // ドットを小さく
      dotBrightness: 0.6, // ドットを暗く
      zIndex: 2,
      label: "階段上通り",
    },
  ];

  return (
    <>
      {targetRows.map((row, rowIndex) => {
        // 通りごとにドット配列を生成
        const dotElements = Array.from({ length: numDots }).map((_, i) => {
          // センター基準の相対位置計算（i=0 ➔ -Xpx, i=9 ➔ 0px(センター), i=18 ➔ +Xpx）
          const dotPosition = (i - (numDots - 1) / 2) * row.dotInterval;

          const currentDotStyle: React.CSSProperties = {
            ...dotBaseStyle,
            width: `${row.dotSize}px`,
            height: `${row.dotSize}px`,
            backgroundColor: row.dotBrightness > 0.8 ? "#adff2f" : "#a1e62a", // 明るさで色を変える
            opacity: row.dotBrightness,
            // 発光表現も明るさに合わせて調整
            boxShadow: `0 0 ${10 * row.dotBrightness}px #adff2f, 0 0 ${4 * row.dotBrightness}px #fff`,
            left: `calc(50% + ${dotPosition}px)`,
          };

          return <div key={`dot-${rowIndex}-${i}`} style={currentDotStyle} />;
        });

        return (
          <div
            key={`dot-row-${rowIndex}`}
            style={{
              position: "absolute",
              bottom: row.bottom,
              left: 0,
              right: 0,
              height: "0",
              zIndex: row.zIndex,
              pointerEvents: "none", // 床の操作を邪魔しない
            }}
          >
            {/* アクセシビリティ用のラベル（非表示） */}
            <span style={{ position: "absolute", left: "-1000px" }}>
              {row.label}
            </span>
            {dotElements}
          </div>
        );
      })}
    </>
  );
};
