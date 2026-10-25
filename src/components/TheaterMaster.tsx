import { useState, useEffect, useRef } from "react";
import type {
  StageState,
  CurtainState,
  StagePhase,
  PartType,
} from "../types/theater";
import { SeikoClock } from "./SeikoClock";
import { StageMonitor } from "./StageMonitor";
import { OperatorConsole } from "./OperatorConsole";
import { NarakuMonitor } from "./NarakuMonitor";
import { PromptScriptPopup } from "./PromptScriptPopup";
import { calculateNextStageState } from "../utils/stagePhysics";
import godBurstData from "../data/godBurstScene1.json";

const createDefaultCurtain = (): CurtainState => ({
  position: 100,
  status: "open",
  speedDial: 100,
});
const initialStageState: StageState = {
  curtainMain: createDefaultCurtain(),
  koseri: { currentHeight: 0, status: "stopped", targetNamedPosition: "舞台" },
  curtainMiddle: createDefaultCurtain(),
  curtainBack: createDefaultCurtain(),
  horizone: { active: true, color: "#ffffff" },
  actorPresent: "none",
};

export const TheaterMaster: React.FC = () => {
  const [phase, setPhase] = useState<StagePhase>("SETTING");
  const [mainCurtainMode, setMainCurtainMode] = useState<
    "vertical" | "horizontal"
  >("vertical");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [stageState, setStageState] = useState<StageState>(initialStageState);

  // 🎛️ マルチオペレート対応：'all' の時は全ての『★キカケ』をプレイヤーが叩く
  const [selectedPart, setSelectedPart] = useState<PartType | "all">("all");
  const [syncMessage, setSyncMessage] =
    useState<string>("インカム正常：スタンバイ");

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const executedCueIds = useRef<Set<string>>(new Set());

  const loopStateRef = useRef({ phase, isPlaying, selectedPart, elapsedTime });
  loopStateRef.current = { phase, isPlaying, selectedPart, elapsedTime };

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = time - previousTimeRef.current;
        const current = loopStateRef.current;

        if (current.phase === "PERFORMANCE" && current.isPlaying) {
          setElapsedTime((prev) => {
            const nextTime = prev + deltaTime;

            // 🤖 【オート演出エンジン】
            godBurstData.timeline.forEach((cue) => {
              if (cue.time <= nextTime && !executedCueIds.current.has(cue.id)) {
                // ハック：ラベルに「★」が含まれている、または自分の担当部門のキューは「自動実行しない（待つ）」
                const isPlayerCue =
                  current.selectedPart === "all"
                    ? cue.label.includes("★")
                    : cue.engine === current.selectedPart;

                if (!isPlayerCue) {
                  console.log(`[AUTO] 他部門演出オート駆動: ${cue.label}`);
                  executedCueIds.current.add(cue.id);
                }
              }
            });
            return nextTime;
          });
        }

        setStageState((prev) => {
          const { nextState, isChanged } = calculateNextStageState(
            prev,
            deltaTime,
          );
          return isChanged ? nextState : prev;
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // 🎯 【高精度判定コア】操作盤からも、キーボードの【GO】からもここを通る
  const verifyOperatorTiming = (engine: string, cueAction: string) => {
    if (phase !== "PERFORMANCE" || !isPlaying) return;

    // 現在の時間において、未実行かつ条件に合うターゲットキューを検索
    const targetCue = godBurstData.timeline.find(
      (cue) =>
        cue.engine === engine &&
        cue.cue === cueAction &&
        !executedCueIds.current.has(cue.id),
    );

    if (targetCue) {
      const diff = elapsedTime - targetCue.time;
      const absDiff = Math.abs(diff);

      if (absDiff <= 120)
        setSyncMessage(
          `【PERFECT SYNC!!】 ズレ: ${diff.toFixed(0)}ms (神オペレート) ── ${targetCue.label}`,
        );
      else if (absDiff <= 450)
        setSyncMessage(
          `【SAFE】 ズレ: ${diff.toFixed(0)}ms ── ${targetCue.label}`,
        );
      else
        setSyncMessage(
          `【DELAY! NG】 ズレ: ${diff.toFixed(0)}ms ── ${targetCue.label}`,
        );

      executedCueIds.current.add(targetCue.id);

      // グラフィック演出への数珠繋ぎ連動
      if (cueAction === "CURTAIN_MAIN_OPEN") {
        setStageState((prev) => ({
          ...prev,
          curtainMain: { ...prev.curtainMain, status: "opening" },
        }));
      }
      if (cueAction === "KOSERI_UP_450") {
        setStageState((prev) => ({
          ...prev,
          koseri: {
            ...prev.koseri,
            targetNamedPosition: "+450",
            status: "rising",
          },
        }));
      }
    } else {
      setSyncMessage(
        `【お手付き/誤操作】 現在要求されていないキューです: [${engine} - ${cueAction}]`,
      );
    }
  };

  // ⌨️ 【開発憲法第4条：QLab風スペースキーGO駆動パッチ】
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "PERFORMANCE" || !isPlaying) return;

      // スペースキーが押されたら、現在未実行の「最も古いプレイヤー用キカケキュー」を自動で叩く
      if (e.code === "Space") {
        e.preventDefault();
        const nextPlayerCue = godBurstData.timeline.find(
          (cue) =>
            !executedCueIds.current.has(cue.id) && cue.label.includes("★"),
        );
        if (nextPlayerCue) {
          verifyOperatorTiming(nextPlayerCue.engine, nextPlayerCue.cue);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, isPlaying]);

  const handlePhaseChange = (nextPhase: StagePhase) => {
    setPhase(nextPhase);
    if (nextPhase !== "PERFORMANCE") setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setStageState(initialStageState);
    setPhase("SETTING");
    executedCueIds.current.clear();
    setSyncMessage("インカム正常：スタンバイ");
  };

  // 操作盤からのラップ関数群（既存コンポーネントとの後方互換を維持）
  const triggerCurtain = (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    action: "開" | "閉" | "S",
  ) => {
    if (target === "curtainMain" && action === "開") {
      verifyOperatorTiming("mechanism", "CURTAIN_MAIN_OPEN");
      return;
    }
    // 判定外の通常操作
    setStageState((prev) => {
      const curtain = prev[target];
      let stat = curtain.status;
      if (action === "開") stat = "opening";
      if (action === "閉") stat = "closing";
      if (action === "S") stat = "stopped";
      return { ...prev, [target]: { ...curtain, status: stat } };
    });
  };

  const changeCurtainSpeed = (
    target: "curtainMain" | "curtainMiddle" | "curtainBack",
    speed: number,
  ) => {
    setStageState((prev) => ({
      ...prev,
      [target]: { ...prev[target], speedDial: speed },
    }));
  };

  const triggerKoseri = (namedPos: "+450" | "舞台" | "ぬすみ" | "奈落") => {
    if (namedPos === "+450") {
      verifyOperatorTiming("mechanism", "KOSERI_UP_450");
      return;
    }
    // 判定外の通常操作
    setStageState((prev) => {
      const current = prev.koseri.currentHeight;
      let target = current;
      if (namedPos === "舞台") target = 0;
      if (namedPos === "ぬすみ") target = -50;
      if (namedPos === "奈落") target = -4000;
      const stat =
        target > current ? "rising" : target < current ? "falling" : "stopped";
      return {
        ...prev,
        koseri: { ...prev.koseri, targetNamedPosition: namedPos, status: stat },
      };
    });
  };

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
        padding: "0",
        backgroundColor: "#0b0c0d",
        color: "#fff",
        minHeight: "100vh",
        width: "100vw",
        fontFamily: "monospace",
        position: "relative",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <style>{`#root, body, html { margin: 0 !important; padding: 0 !important; max-width: none !important; width: 100vw !important; background-color: #0b0c0d !important; }`}</style>

      <div
        style={{
          padding: "15px",
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
        }}
      >
        {/* 📖 上演原稿モニター（縦書き・右スクロール） */}
        <PromptScriptPopup
          scriptData={godBurstData as any}
          elapsedTime={elapsedTime}
        />

        {/* 興行進行管理マネージャー UI */}
        <div
          style={{
            padding: "12px",
            backgroundColor: "#191b1f",
            borderRadius: "4px",
            borderLeft: "5px solid #00ffcc",
            marginBottom: "15px",
            border: "1px solid #282a30",
          }}
        >
          {/* 👇 ここです！ justifyConten を justifyContent に修正 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "13px", color: "#00ffcc" }}>
              📋 統合コントロールセンター
              <span
                style={{ marginLeft: "10px", color: "#888", fontSize: "11px" }}
              >
                [SPACEキーで全セクションの★キカケをGO駆動可能]
              </span>
            </h3>
            <div
              style={{
                color: syncMessage.includes("PERFECT") ? "#f1c40f" : "#00ffcc",
                fontWeight: "bold",
                fontSize: "14px",
                fontFamily: "monospace",
              }}
            >
              {syncMessage}
            </div>
          </div>
          {/* モード切替兼フェーズボタン */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            {(
              [
                "SETTING",
                "DOORS_OPEN",
                "PERFORMANCE",
                "INTERMISSION",
                "POST_SHOW",
                "EXIT",
              ] as StagePhase[]
            ).map((p) => (
              <button
                key={p}
                onClick={() => handlePhaseChange(p)}
                style={{
                  padding: "6px 10px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  backgroundColor: phase === p ? "#00ffcc" : "#2a2c30",
                  color: phase === p ? "#000" : "#ccc",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                {p === "SETTING" && "1.仕込み(SETTING)"}{" "}
                {p === "DOORS_OPEN" && "2.開場(客入れ)"}{" "}
                {p === "PERFORMANCE" && "3.本本番(PERFORMANCE)"}{" "}
                {p === "INTERMISSION" && "4.幕間(転換)"}{" "}
                {p === "POST_SHOW" && "5.終演(バラシ)"}{" "}
                {p === "EXIT" && "6.客だし"}
              </button>
            ))}

            {/* 🎧 セクションセレクトの増設（デバッグ・拡張用） */}
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value as any)}
              style={{
                backgroundColor: "#2a2c30",
                color: "#fff",
                border: "none",
                borderRadius: "3px",
                fontSize: "11px",
                padding: "0 10px",
              }}
            >
              <option value="all">🎮 全セクション統括 (★マニュアル)</option>
              <option value="mechanism">⚙️ 機構セクション担当</option>
            </select>

            <button
              onClick={handleReset}
              style={{
                padding: "6px 10px",
                backgroundColor: "#444",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                marginLeft: "auto",
                color: "#fff",
              }}
            >
              RESET
            </button>
          </div>

          {phase === "PERFORMANCE" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                backgroundColor: "#111",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ff3333",
              }}
            >
              <span
                style={{
                  color: "#ff3333",
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              >
                ⚠️ インカム・シネマティック駆動：
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  padding: "6px 15px",
                  backgroundColor: isPlaying ? "#ff3333" : "#33cc33",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  borderRadius: "3px",
                  fontSize: "11px",
                }}
              >
                {isPlaying
                  ? "⏱ STOPWATCH PAUSE"
                  : "🚀 開演ブザー ➔ タイマースタート"}
              </button>
            </div>
          )}
        </div>

        {/* モニター配置セクション */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "15px",
          }}
        >
          <SeikoClock
            elapsedTime={elapsedTime}
            isPlaying={isPlaying && phase === "PERFORMANCE"}
          />
          <div style={{ flex: "1", minWidth: "320px" }}>
            <StageMonitor
              stageState={stageState}
              mainCurtainMode={mainCurtainMode}
            />
          </div>
        </div>

        {/* コクピットセクション */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1", minWidth: "400px" }}>
            <OperatorConsole
              stageState={stageState}
              phase={phase}
              mainCurtainMode={mainCurtainMode}
              onMainCurtainModeChange={setMainCurtainMode}
              onCurtainAction={triggerCurtain}
              onCurtainSpeedChange={changeCurtainSpeed}
              onKoseriAction={triggerKoseri}
              onKoseriStop={stopKoseri}
            />
          </div>
          <NarakuMonitor stageState={stageState} />
        </div>
      </div>
    </div>
  );
};
