import React from "react";

interface KoseriProps {
  currentHeight: number;
  targetNamedPosition: string;
  actorPresent: "none" | "back-stage" | "on-stage" | "haked";
}

export const Koseri: React.FC<KoseriProps> = ({
  currentHeight,
  targetNamedPosition,
  actorPresent,
}) => {
  // 💡 ミリ秒の微細な浮きを排除するため、四捨五入してジャスト0mm判定を作る
  const isFlat = Math.round(currentHeight) === 0;

  // 3D空間へのリフトマッピング
  let seliLiftY = 0;
  if (currentHeight >= 0) {
    seliLiftY = (currentHeight / 450) * 32;
  } else {
    seliLiftY = Math.max(-50, (currentHeight / -600) * -50);
  }

  // 🚨【大原因バグ修正】外親コンテナが既に rotateX(25deg) しているため、
  // 子の移動スタイルからは rotateX を完全撤去！(二重回転による激しいペチャンコ潰れを解消)
  const seliTransform = `translateY(${-seliLiftY}px)`;

  // 奈落の闇に沈むにつれて役者が暗くなる職人演出
  const actorBrightness =
    seliLiftY < 0 ? Math.max(0.15, 1 + currentHeight / 1000) : 1;

  return (
    <>
      {/* 🕳 LAYER 5.2: 奈落の暗黒大穴 */}
      {/* 💡 0mm（フラット時）は、隙間からの黒漏れを完全に防ぐために display: "none" で隠蔽！ */}
      <div
        style={{
          position: "absolute",
          top: "265px",
          left: "50%",
          transform: "translateX(-50%) rotateX(25deg) translateZ(1px)",
          width: "150px",
          height: "54px",
          backgroundColor: "#020203",
          boxShadow: "inset 0 10px 30px rgba(0,0,0,1)",
          zIndex: 11,
          display: isFlat ? "none" : "block",
        }}
      />

      {/* 🎛 LAYER 5.3: 位置固定の3Dパース・クリップコンテナ */}
      <div
        style={{
          position: "absolute",
          top: "265px",
          left: "50%",
          transform: "translateX(-50%) rotateX(25deg)",
          transformOrigin: "top center",
          width: "150px",
          height: "54px",
          zIndex: 12,
          clipPath: "inset(-500px -200px 0px -200px)",
        }}
      >
        {/* ─── これより内部は「rotateX(25deg)」の傾いた3Dローカル空間 ─── */}

        {/* 🎛 LAYER 5.4: 立体小迫り台座 */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0", // 隙間を無くすため、大穴の横幅とジャスト同期
            width: "150px",
            height: "54px",
            transform: seliTransform,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",

            // ✨【職人同化トリック】
            // 0mm（フラット）の時は、背景を「透明」にしてステージ床のグラデーションを100%そのまま透過！
            // 盛り上がりの原因だった「太い白枠」を排除し、床のリアルな「切り込み線（目地）」のみに変貌。
            background: isFlat
              ? "transparent"
              : "linear-gradient(to bottom, #e8e8e8, #c5c5c5)",
            border: isFlat
              ? "1px solid rgba(0, 0, 0, 0.2)" // 床のうっすらとした隙間線
              : "1px solid #fff",
            boxShadow: isFlat
              ? "none"
              : "inset 0 0 4px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.3)",
          }}
        >
          <span
            style={{
              color: isFlat ? "rgba(0,0,0,0.4)" : "#444",
              fontSize: "9px",
              fontWeight: "bold",
              textShadow: isFlat ? "none" : "0 1px 1px rgba(255,255,255,0.8)",
            }}
          >
            {targetNamedPosition === "ぬすみ" && currentHeight === -50
              ? "ぬすみ"
              : `${Math.round(currentHeight)}mm`}
          </span>

          {/* 上昇時に出現する迫りの「壁（側面）」 */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "0",
              width: "150px",
              transformOrigin: "top center",
              background: "linear-gradient(to bottom, #444, #111)",
              border: "1px solid #222",
              borderTop: "none",
              height: seliLiftY > 0 ? `${seliLiftY}px` : "0px",
              display: seliLiftY > 0 ? "block" : "none",
            }}
          />

          {/* 🕺 LAYER 5.5: 役者（セリの床の上に完全にドッキング） */}
          <div
            style={{
              position: "absolute",
              bottom: "22px",
              left: "50%",
              pointerEvents: "none",
              transform: "translateX(-50%) rotateX(-25deg)", // 親の傾斜を打ち消して直立
              transformOrigin: "bottom center",
              filter: seliLiftY < 0 ? `brightness(${actorBrightness})` : "none",
              display: actorPresent === "on-stage" ? "block" : "none",
              fontSize: "28px",
              lineHeight: "1",
            }}
          >
            🕺
          </div>
        </div>
      </div>
    </>
  );
};
