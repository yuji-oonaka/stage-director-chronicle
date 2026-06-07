import React, { useState, useEffect } from "react";

interface SeikoClockProps {
  elapsedTime: number; // 親から流れてくる演目経過時間（ミリ秒）
  isPlaying: boolean; // 進行状態
}

export const SeikoClock: React.FC<SeikoClockProps> = ({
  elapsedTime,
  isPlaying,
}) => {
  // 現在のリアル時間（電波時計としての機能）
  const [realTime, setRealTime] = useState<Date>(new Date());

  // 1秒ごとにリアル時間を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ミリ秒を 「分:秒.ミリ秒」 の職人フォーマットに変換する関数
  const formatStopwatch = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor(ms % 1000);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
  };

  // リアル時間のフォーマット（HH:MM:SS）
  const formatRealTime = (date: Date) => {
    return date.toTimeString().split(" ")[0];
  };

  // 日付のフォーマット（YYYY-MM-DD）
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div
      style={{
        backgroundColor: "#222514", // 液晶の消灯部分を意識した暗い黄緑
        color: "#adff2f", // 怪しく光る蛍光黄緑（Green-Yellow）
        padding: "15px",
        borderRadius: "6px",
        border: "4px solid #444", // ガチッとしたプラスチック筐体風
        fontFamily: '"Courier New", Courier, monospace',
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.8)",
        width: "380px",
        margin: "10px 0",
      }}
    >
      {/* 上段：電波時計・環境情報セクション */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          borderBottom: "1px solid rgba(173, 255, 47, 0.3)",
          paddingBottom: "5px",
          marginBottom: "8px",
        }}
      >
        <div>
          <span>{formatLocalDate(realTime)}</span>
          <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
            {formatRealTime(realTime)}
          </span>
        </div>
        <div>
          {/* 将来の伏線：温度・湿度 */}
          <span>24.5℃</span>
          <span style={{ marginLeft: "10px" }}>52%</span>
        </div>
      </div>

      {/* 下段：メインストップウォッチ */}
      <div style={{ textAlign: "right", position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            fontSize: "10px",
            color: isPlaying ? "#adff2f" : "rgba(173, 255, 47, 0.2)",
            border: "1px solid",
            padding: "1px 3px",
            borderRadius: "2px",
          }}
        >
          {isPlaying ? "RUN" : "STBY"}
        </span>

        <div
          style={{
            fontSize: "38px",
            fontWeight: "bold",
            letterSpacing: "2px",
            textShadow: "0 0 4px rgba(173, 255, 47, 0.6)",
          }}
        >
          {formatStopwatch(elapsedTime)}
        </div>
      </div>
    </div>
  );
};
