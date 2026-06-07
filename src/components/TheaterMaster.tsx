import { useState, useEffect, useRef } from "react";
// KoseriState をインポートから削除
import type { StageState, TimelineEvent, CurtainState } from "../types/theater";
import timelineData from "../data/timeline.json";
import { SeikoClock } from "./SeikoClock";

// 幕の初期状態を生成するヘルパー
const createInitialCurtain = (): CurtainState => ({
  position: 0, // 0: 全閉、100: 全開
  status: "closed",
  speedDial: 50, // 写真のダイヤル初期値を意識して50%スタート
});

// 新・舞台初期状態（本物の構造レイヤーを完全網羅）
const initialStageState: StageState = {
  curtainMain: createInitialCurtain(), // 1. 緞帳
  koseri: {
    // 2. 小迫り
    currentHeight: -1000, // 奈落（地下1000mm）に沈んでいる状態スタート
    status: "down",
    targetNamedPosition: "奈落",
  },
  curtainMiddle: createInitialCurtain(), // 3. 中割幕
  curtainBack: createInitialCurtain(), // 4. 引割緞帳（渡りの引き割幕）
  horizone: { active: false, color: "#050505" },
  actorPresent: "none",
};

// シミュレーション用の基準速度設定
const CURTAIN_BASE_SPEED = 0.01; // 100%速度のとき、1msあたりに動く幕の％量
const KOSERI_SPEED = 0.3; // 1msあたりに昇降するミリメートル（mm）

export const TheaterMaster: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [stageState, setStageState] = useState<StageState>(initialStageState);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const timeline: TimelineEvent[] = timelineData as TimelineEvent[];

  // 毎フレーム呼ばれる高精度シミュレーション関数
  const animate = (time: number) => {
    if (previousTimeRef.current !== null) {
      const deltaTime = time - previousTimeRef.current;
      setElapsedTime((prevTime) => prevTime + deltaTime);

      // --- 物理数値のリアルタイム計算処理 ---
      setStageState((prev) => {
        const next = { ...prev };

        // 1. 各種幕（緞帳、中割、引割）のシミュレーション計算
        const updateCurtain = (curtain: CurtainState): CurtainState => {
          let pos = curtain.position;
          let stat = curtain.status;
          // ダイヤル速度(%)に応じた実際の移動速度
          const speed =
            deltaTime * CURTAIN_BASE_SPEED * (curtain.speedDial / 100);

          if (stat === "opening") {
            pos += speed;
            if (pos >= 100) {
              pos = 100;
              stat = "open";
            }
          } else if (stat === "closing") {
            pos -= speed;
            if (pos <= 0) {
              pos = 0;
              stat = "closed";
            }
          }
          return { ...curtain, position: pos, status: stat };
        };

        next.curtainMain = updateCurtain(next.curtainMain);
        next.curtainMiddle = updateCurtain(next.curtainMiddle);
        next.curtainBack = updateCurtain(next.curtainBack);

        // 2. 小迫り（セリ）の無段階・目標値ターゲット昇降計算
        let kHeight = next.koseri.currentHeight;
        let kStatus = next.koseri.status;
        let targetHeight = kHeight;

        // ボタンから指定された名前ベースの目標ミリ数を割り出す
        if (next.koseri.targetNamedPosition === "+450") targetHeight = 450;
        if (next.koseri.targetNamedPosition === "舞台") targetHeight = 0;
        if (next.koseri.targetNamedPosition === "ぬすみ") targetHeight = -50;
        if (next.koseri.targetNamedPosition === "奈落") targetHeight = -1000;

        if (kStatus === "rising") {
          kHeight += deltaTime * KOSERI_SPEED;
          if (kHeight >= targetHeight) {
            kHeight = targetHeight;
            kStatus = kHeight === 450 ? "up" : "stopped";
          }
        } else if (kStatus === "falling") {
          kHeight -= deltaTime * KOSERI_SPEED;
          if (kHeight <= targetHeight) {
            kHeight = targetHeight;
            kStatus = kHeight === -1000 ? "down" : "stopped";
          }
        }

        next.koseri = {
          ...next.koseri,
          currentHeight: kHeight,
          status: kStatus,
        };

        return next;
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setStageState(initialStageState);
  };

  // --- 【新規】実物写真ボタンを模した仮のイベントハンドラー群 ---
  // 幕の操作（引割幕・中割幕・引割緞帳を一括で処理できる汎用関数）
  const triggerCurtain = (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    action: "開" | "閉" | "S",
  ) => {
    setStageState((prev) => {
      const curtain = prev[target];
      let stat = curtain.status;
      if (action === "開") stat = "opening";
      if (action === "閉") stat = "closing";
      if (action === "S") stat = "stopped";
      return { ...prev, [target]: { ...curtain, status: stat } };
    });
  };

  // 幕の速度ダイヤル変更（％変更）
  const changeCurtainSpeed = (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    speed: number,
  ) => {
    setStageState((prev) => ({
      ...prev,
      [target]: { ...prev[target], speedDial: speed },
    }));
  };

  // 小迫りの目標位置指定操作（+450、舞台、ぬすみ、奈落）
  const triggerKoseri = (namedPos: "+450" | "舞台" | "ぬすみ" | "奈落") => {
    setStageState((prev) => {
      const current = prev.koseri.currentHeight;
      let target = current;
      if (namedPos === "+450") target = 450;
      if (namedPos === "舞台") target = 0;
      if (namedPos === "ぬすみ") target = -50;
      if (namedPos === "奈落") target = -1000;

      const stat =
        target > current ? "rising" : target < current ? "falling" : "stopped";
      return {
        ...prev,
        koseri: { ...prev.koseri, targetNamedPosition: namedPos, status: stat },
      };
    });
  };

  // 小迫りの緊急ストップ
  const stopKoseri = () => {
    setStageState((prev) => ({
      ...prev,
      koseri: {
        ...prev.koseri,
        status: "stopped",
        targetNamedPosition: "none",
      },
    }));
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#111",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "monospace",
      }}
    >
      <h2
        style={{
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
          color: "#00ffcc",
        }}
      >
        【新主制御盤】TheaterMaster (親)
      </h2>

      {/* 演目RUN/RESETコンソール */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#222",
          borderRadius: "4px",
        }}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: isPlaying ? "#ff3333" : "#33cc33",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isPlaying ? "PAUSE (一時停止)" : "RUN (演目スタート)"}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: "10px 20px",
            backgroundColor: "#555",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          RESET (リセット)
        </button>
      </div>

      {/* 時計コンポーネントのみ配置（Propsの型が変わっていないため安全） */}
      <div style={{ marginBottom: "20px" }}>
        <SeikoClock elapsedTime={elapsedTime} isPlaying={isPlaying} />
      </div>

      {/* --- 仮設置：新仕様ロジックの動作検証用ミニボタン群 --- */}
      <div
        style={{
          backgroundColor: "#222",
          padding: "15px",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#ff9900" }}>
          🧪 新仕様ロジック リアルタイム動作テスト
        </h4>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => triggerCurtain("curtainMiddle", "開")}>
            中割幕 【開】
          </button>
          <button onClick={() => triggerCurtain("curtainMiddle", "閉")}>
            中割幕 【閉】
          </button>
          <button onClick={() => triggerCurtain("curtainMiddle", "S")}>
            中割幕 【S】ストップ
          </button>
          <span style={{ color: "#aaa" }}>| 速度ダイヤル:</span>
          <button onClick={() => changeCurtainSpeed("curtainMiddle", 10)}>
            10%
          </button>
          <button onClick={() => changeCurtainSpeed("curtainMiddle", 50)}>
            50%
          </button>
          <button onClick={() => changeCurtainSpeed("curtainMiddle", 100)}>
            100%
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => triggerKoseri("+450")}>小迫り 【+450】</button>
          <button onClick={() => triggerKoseri("舞台")}>
            小迫り 【舞台】(0)
          </button>
          <button onClick={() => triggerKoseri("ぬすみ")}>
            小迫り 【ぬすみ】(-50)
          </button>
          <button onClick={() => triggerKoseri("奈落")}>
            小迫り 【奈落】(-1000)
          </button>
          <button
            onClick={() => stopKoseri()}
            style={{ backgroundColor: "#aa3333", color: "#fff" }}
          >
            迫り【S】停止
          </button>
        </div>
      </div>

      {/* リアルタイム数値デバッグモニター */}
      <div
        style={{
          borderTop: "1px solid #333",
          paddingTop: "20px",
          fontSize: "13px",
          color: "#00ff00",
          lineHeight: "1.6",
        }}
      >
        <h3>📊 リアルタイム物理挙動データ（ここがウィーンと増減します）</h3>
        <div>
          🎬 緞帳の位置: {stageState.curtainMain.position.toFixed(1)}% (
          {stageState.curtainMain.status.toUpperCase()})
        </div>
        <div>
          🎬 中割幕の位置: {stageState.curtainMiddle.position.toFixed(1)}%
          (速度: {stageState.curtainMiddle.speedDial}%, 状態:{" "}
          {stageState.curtainMiddle.status.toUpperCase()})
        </div>
        <div>
          🎬 引割緞帳の位置: {stageState.curtainBack.position.toFixed(1)}% (
          {stageState.curtainBack.status.toUpperCase()})
        </div>
        <div style={{ color: "#ffff00", marginTop: "5px" }}>
          🏗 小迫りの高さ:{" "}
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            {Math.round(stageState.koseri.currentHeight)}
          </span>{" "}
          mm (状態: {stageState.koseri.status.toUpperCase()}, 目標:{" "}
          {stageState.koseri.targetNamedPosition})
        </div>

        {/* 【復活】timeline を使用して警告をクリア */}
        <div style={{ color: "#888", fontSize: "11px", marginTop: "10px" }}>
          📁 読み込み済みの総演出キュー数: {timeline.length} 個
        </div>
      </div>
    </div>
  );
};
