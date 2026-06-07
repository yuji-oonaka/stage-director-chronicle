import type { StageState } from "../types/theater";

interface StageMonitorProps {
  stageState: StageState;
}

export const StageMonitor: React.FC<StageMonitorProps> = ({ stageState }) => {
  const {
    curtainMain,
    koseri,
    curtainMiddle,
    curtainBack,
    horizone,
    actorPresent,
  } = stageState;

  // 1. 【最奥】ホリゾント幕（写真1の美しいグラデーション）
  const horizoneBg = horizone.active
    ? "linear-gradient(to bottom, #1a66ff 0%, #ffb366 70%, #ffffff 100%)"
    : "#111";

  // 2. 小迫り（セリ）の物理ミリ数（-1000 〜 450）を、斜め上パース用のY軸（px）に変換
  const kHeight = koseri.currentHeight;
  let seliLiftY = 0; // 上下への飛び出し量（px）
  if (kHeight >= 0) {
    seliLiftY = (kHeight / 450) * 35; // 舞台面より上に最大35px飛び出す
  } else {
    seliLiftY = (kHeight / -1000) * -30; // 奈落へ最大30px沈む
  }

  // 3. 各種幕の「ひだ（ギャザー）」を表現する立体グラデーション（これで黒同士でも完全に見分けがつきます）
  const curtainMainBg =
    "linear-gradient(to right, #400 0%, #800 25%, #300 50%, #800 75%, #400 100%)"; // 緞帳：深紅
  const curtainMiddleBg =
    "linear-gradient(to right, #0a0b0d 0%, #1c1e24 25%, #050506 50%, #1c1e24 75%, #0a0b0d 100%)"; // 中割：濃紺黒
  const curtainBackBg =
    "linear-gradient(to right, #141414 0%, #2b2b2b 25%, #0d0d0d 50%, #2b2b2b 75%, #141414 100%)"; // 引割：チャコールグレー

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "650px",
        height: "380px",
        backgroundColor: "#050505",
        border: "4px solid #222",
        position: "relative",
        overflow: "hidden",
        borderRadius: "6px",
        boxShadow: "inset 0 0 40px rgba(0,0,0,1)",
        fontFamily: "monospace",
        // 💡 ここがキモ：子要素すべてに3D奥行き空間を適用する
        perspective: "500px",
      }}
    >
      {/* 画面上部ラベル */}
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

      {/* =========================================================
          空間レイヤー（奥 z-index:1 ➔ 手前 z-index:20）
         ========================================================= */}

      {/* LAYER 1: 最奥ホリゾントの壁（固定） */}
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

      {/* LAYER 2: 渡りの引き割幕（引割緞帳） - ホリゾントのすぐ手前 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${50 - curtainBack.position / 2}%`,
          height: "240px",
          background: curtainBackBg,
          borderRight: "1px solid #000",
          zIndex: 2,
          transition: "width 0.1s linear",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${50 - curtainBack.position / 2}%`,
          height: "240px",
          background: curtainBackBg,
          borderLeft: "1px solid #000",
          zIndex: 2,
          transition: "width 0.1s linear",
        }}
      />

      {/* LAYER 3: 中割幕 - ステージ中央の引き幕 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${50 - curtainMiddle.position / 2}%`,
          height: "240px",
          background: curtainMiddleBg,
          borderRight: "2px solid #000",
          zIndex: 3,
          transition: "width 0.1s linear",
          boxShadow: "10px 0 20px rgba(0,0,0,0.8)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${50 - curtainMiddle.position / 2}%`,
          height: "240px",
          background: curtainMiddleBg,
          borderLeft: "2px solid #000",
          zIndex: 3,
          transition: "width 0.1s linear",
          boxShadow: "-10px 0 20px rgba(0,0,0,0.8)",
        }}
      />

      {/* 💡 LAYER 4: 【劇的刷新】斜め上から見下ろす「白っぽい灰色の床」 */}
      {/* 遠近感を出すために、奥を狭く、手前を広く3D回転させます */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "-50px",
          right: "-50px",
          height: "140px",
          background:
            "linear-gradient(to bottom, #dcdcdc 0%, #f5f5f5 30%, #b8b8b8 100%)", // 白っぽい灰色の光沢床
          borderTop: "3px solid #eee",
          zIndex: 4,
          // 3Dひねり：X軸を手前に25度倒すことで、極上の俯瞰パースが完成
          transform: "rotateX(25deg)",
          transformOrigin: "top center",
          boxShadow: "0 -5px 15px rgba(0,0,0,0.5)",
        }}
      >
        {/* 床の中に穿たれた「奈落の穴」（セリが沈んでいる時だけぽっかり現れる暗黒空間） */}
        {kHeight < 0 && (
          <div
            style={{
              position: "absolute",
              top: "15px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "150px",
              height: "55px",
              backgroundColor: "#000",
              border: "2px solid #555",
              boxShadow: "inset 0 10px 20px rgba(0,0,0,1)",
            }}
          />
        )}
      </div>

      {/* 🏗 LAYER 5: 3D連動する立体「小迫り（セリ）」 */}
      {/* 床の傾きと連動させつつ、Y軸（seliLiftY）の数値でエレベーターのように上下させます */}
      <div
        style={{
          position: "absolute",
          top: "235px", // 舞台床の結合ライン
          left: "50%",
          transform: `translateX(-50%) translateY(${-seliLiftY}px) rotateX(25deg)`, // 上下にウィーンと移動
          transformOrigin: "top center",
          zIndex: 5,
          transition: "transform 0.1s linear",
        }}
      >
        {/* セリの天板（床と同じ白っぽい灰色、ただし独立して浮き上がる） */}
        <div
          style={{
            width: "146px",
            height: "52px",
            background: "linear-gradient(to bottom, #e2e2e2, #c8c8c8)",
            border: "2px solid #fff",
            position: "relative",
            boxShadow: seliLiftY > 0 ? "0 15px 25px rgba(0,0,0,0.6)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#666", fontSize: "9px", fontWeight: "bold" }}>
            {kHeight === -50 ? "ぬすみ" : Math.round(kHeight) + "mm"}
          </span>

          {/* セリの「側面・厚み」（ここを作ることで、上がったときに立体的な箱に見えます！） */}
          {seliLiftY > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "-2px",
                width: "146px",
                height: `${seliLiftY}px`,
                backgroundColor: "#444",
                border: "2px solid #555",
                borderTop: "none",
                transformOrigin: "top center",
                background: "linear-gradient(to bottom, #555, #222)",
              }}
            />
          )}
        </div>
      </div>

      {/* 🕺 LAYER 6: セリの上の役者（セリの高さ・立体パースに完全追従） */}
      <div
        style={{
          position: "absolute",
          top: `${210 - seliLiftY}px`, // セリの上面ピクセルを正確にトレース
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 6,
          pointerEvents: "none",
          transition: "top 0.1s linear",
          textAlign: "center",
        }}
      >
        {kHeight > -800 && actorPresent === "on-stage" && (
          <div
            style={{
              fontSize: "28px",
              textShadow:
                seliLiftY > 0 ? "0 10px 10px rgba(0,0,0,0.5)" : "none",
              filter: kHeight < 0 ? "brightness(0.2)" : "none", // 奈落に沈みかけている時は暗く
            }}
          >
            🕺
          </div>
        )}
      </div>

      {/* LAYER 7: 【最手前】縦開き昇降式「緞帳（どんちょう）」 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${100 - curtainMain.position}%`,
          background: curtainMainBg,
          borderBottom: "6px solid #d4af37", // 本物の金モールを模したライン
          boxShadow: "0 10px 25px rgba(0,0,0,0.9)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.2)",
          fontSize: "22px",
          fontWeight: "bold",
          letterSpacing: "4px",
          overflow: "hidden",
          transition: "height 0.1s linear",
        }}
      >
        {curtainMain.position < 95 && "【 緞 帳 】"}
      </div>

      {/* LAYER 8: 最手前下部・YAMAHA QL5 メーターフレーム（写真1オマージュ） */}
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
  );
};
