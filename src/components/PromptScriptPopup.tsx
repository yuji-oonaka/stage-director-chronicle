import React, { useState, useEffect, useRef } from "react";
import type { PlayScriptData } from "../types/theater";

interface PromptScriptPopupProps {
  scriptData: PlayScriptData & {
    blockNames: Record<string, string>;
    dialogues: any[];
  };
  elapsedTime: number;
}

export const PromptScriptPopup: React.FC<PromptScriptPopupProps> = ({
  scriptData,
  elapsedTime,
}) => {
  const [pos, setPos] = useState({ x: 420, y: 140 });
  const [size, setSize] = useState({ w: 850, h: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [pinned, setPinned] = useState(true);

  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // 🔗 【コア・ドッキングロジック】
  // 別々だった「演出キュー・インカム」と「役者のセリフ」を、ミリ秒時間をキーにして一列のタイムラインに自動合成！
  const mergedTimeline = [
    ...scriptData.timeline.map((c) => ({
      ...c,
      isDialogue: false,
      uniqueId: `cue-${c.id}`,
    })),
    ...scriptData.dialogues.map((d) => ({
      id: d.id,
      time: d.time,
      engine: "script" as const,
      label: `${d.character}${d.text}`,
      isDialogue: true,
      uniqueId: `diag-${d.id}`,
    })),
  ].sort((a, b) => a.time - b.time); // 時間軸で冷徹にソート

  // 現在の時間に対応するアクティブ行を特定
  const currentItem = [...mergedTimeline]
    .reverse()
    .find((item) => elapsedTime >= item.time);

  // ブロック名（ページ番号）の動的取得
  const getBlockName = (itemId: string) => {
    const cleanId = itemId.replace("cue-", "").replace("diag-", "");
    return scriptData.blockNames[cleanId] || "演出進行";
  };

  // 文字列から動的にカラーボックスの色を生成（どんな演目が来ても自動で綺麗に色分け）
  const getCharacterBgColor = (label: string, isDialogue: boolean) => {
    if (!isDialogue) return "#eae7e1"; // インカムや演出指示は落ち着いたグレー
    const characterName = label.split("「")[0] || "役者";
    let hash = 0;
    for (let i = 0; i < characterName.length; i++) {
      hash = characterName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 140) + 100; // パステル調の水色〜緑〜黄色
    return `hsl(${h}, 85%, 75%)`;
  };

  // 📌 追従ONの時、現在なぞっているセリフの列へ滑らかに自動横スクロール（右から左）
  useEffect(() => {
    if (activeLineRef.current && pinned) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentItem, pinned]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleResizeDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging)
        setPos({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
      if (isResizing) {
        setSize({
          w: Math.max(
            400,
            resizeStart.current.w + (e.clientX - resizeStart.current.x),
          ),
          h: Math.max(
            250,
            resizeStart.current.h + (e.clientY - resizeStart.current.y),
          ),
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${size.w}px`,
        height: `${size.h}px`,
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d0c4b0",
        boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        zIndex: 999,
        overflow: "hidden",
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          padding: "6px 16px",
          backgroundColor: "#f4f1ea",
          cursor: "move",
          display: "flex",
          justifyContent: "space-between", // ✨ すっきり！
          alignItems: "center",
          userSelect: "none",
          borderBottom: "1px solid #e2dcd0",
        }}
      >
        <span style={{ fontSize: "11px", color: "#666", fontWeight: "bold" }}>
          📖 上演原稿モニター（完全データ駆動パッチ）
        </span>
        <button
          onClick={() => setPinned(!pinned)}
          style={{
            backgroundColor: pinned ? "#0055cc" : "#666",
            color: "#fff",
            border: "none",
            borderRadius: "2px",
            fontSize: "10px",
            padding: "2px 8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {pinned ? "📌 自動追従・青ペンON" : "🔓 スクロール先読み自由"}
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row-reverse",
          overflowX: "auto",
          overflowY: "hidden",
          padding: "35px 40px",
          gap: "45px",
          boxSizing: "border-box",
          backgroundColor: "#fff",
        }}
      >
        {mergedTimeline.map((item) => {
          const isRunning = currentItem?.uniqueId === item.uniqueId;
          const character = item.isDialogue
            ? item.label.split("「")[0]
            : "インカム";
          const dialogue = item.isDialogue
            ? `：${item.label.split("「")[1]?.replace("」", "") || ""}`
            : ` ── ${item.label}`;

          return (
            <div
              key={item.uniqueId}
              ref={isRunning ? activeLineRef : null}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                minWidth: "55px",
                position: "relative",
                opacity: isRunning ? 1 : 0.35,
                transform: isRunning ? "scale(1.01)" : "scale(1)",
                transition: "all 0.2s ease",
              }}
            >
              {/* ⏱️ セリフ・インカムの真上に配置された共通の時間目安 */}
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: isRunning ? "#0055cc" : "#999",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  writingMode: "horizontal-tb",
                }}
              >
                {(item.time / 1000).toFixed(1)}s
              </span>

              {/* 🏷️ 動的役名ボックス＆青ペンマジックのページ番号（ホバーや補助情報として） */}
              <div
                title={`ブロック: ${getBlockName(item.uniqueId)}`}
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                  backgroundColor: getCharacterBgColor(
                    item.label,
                    item.isDialogue,
                  ),
                  color: item.isDialogue ? "#000" : "#555",
                  fontWeight: "bold",
                  fontSize: "12px",
                  padding: "6px 4px",
                  borderRadius: "1px",
                  minHeight: "65px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  letterSpacing: "2px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  marginBottom: "15px",
                  width: "24px",
                }}
              >
                {character}
              </div>

              {/* 🖊️ 日本の縦書き ＆ 青ペンリアルタイムハイライト */}
              <div
                style={{
                  flex: 1,
                  writingMode: "vertical-rl",
                  direction: "ltr",
                  fontFamily: "'Sawarabi Mincho', 'Noto Serif JP', serif",
                  fontSize: "18px",
                  color: isRunning
                    ? "#0022aa"
                    : !item.isDialogue
                      ? "#777"
                      : "#1a1a1a",
                  lineHeight: "2.4",
                  letterSpacing: "1px",
                  height: "calc(100% - 115px)",
                  padding: "10px 4px",
                  borderRadius: "2px",
                  whiteSpace: "nowrap",
                  background: isRunning
                    ? "linear-gradient(to left, rgba(0, 120, 255, 0.18) 0%, rgba(0, 120, 255, 0.18) 100%)"
                    : "transparent",
                  boxShadow: isRunning
                    ? "inset 0 0 0 1px rgba(0, 120, 255, 0.22)"
                    : "none",
                }}
              >
                {dialogue}
              </div>
            </div>
          );
        })}
      </div>
      <div
        onMouseDown={handleResizeDown}
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "14px",
          height: "14px",
          cursor: "se-resize",
          background: "linear-gradient(135deg, transparent 6px, #bbb 6px)",
        }}
      />
    </div>
  );
};
