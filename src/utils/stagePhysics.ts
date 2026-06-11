// utils/stagePhysics.ts (新設、またはTheaterMasterのファイル下部でも可)
import type { StageState, CurtainState } from "../types/theater";

const CURTAIN_BASE_SPEED = 0.01;

/**
 * 前フレームの状態と経過時間（deltaTime）を受け取り、次のフレームの舞台状態を計算する純粋関数
 */
export const calculateNextStageState = (
  prev: StageState,
  deltaTime: number,
): { nextState: StageState; isChanged: boolean } => {
  let isChanged = false;
  const next = JSON.parse(JSON.stringify(prev)) as StageState; // 深いコピーで安全に書き換え

  // 1. 幕（緞帳・中割・引割）の共通物理計算
  const updateCurtain = (curtain: CurtainState): CurtainState => {
    let pos = curtain.position;
    let stat = curtain.status;
    const speed = deltaTime * CURTAIN_BASE_SPEED * (curtain.speedDial / 100);

    if (stat === "opening") {
      isChanged = true;
      pos += speed;
      if (pos >= 100) {
        pos = 100;
        stat = "open";
      }
    } else if (stat === "closing") {
      isChanged = true;
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

  // 2. 小迫り（セリ）の可変スピードインバーター制御
  let kHeight = next.koseri.currentHeight;
  let kStatus = next.koseri.status;
  let targetHeight = kHeight;

  if (next.koseri.targetNamedPosition === "+450") targetHeight = 450;
  if (next.koseri.targetNamedPosition === "舞台") targetHeight = 0;
  if (next.koseri.targetNamedPosition === "ぬすみ") targetHeight = -50;
  if (next.koseri.targetNamedPosition === "奈落") targetHeight = -4000;

  if (kStatus === "falling") {
    isChanged = true;
    const currentSpeed = kHeight > -1000 ? 0.2 : 0.85; // 見える区間は安全速度、消えたら奈落へ急降下
    kHeight -= deltaTime * currentSpeed;
    if (kHeight <= targetHeight) {
      kHeight = targetHeight;
      kStatus = kHeight === -4000 ? "down" : "stopped";
    }
  } else if (kStatus === "rising") {
    isChanged = true;
    const currentSpeed = kHeight >= 0 ? 0.08 : 0.35; // 露出区間は超慎重スロー、地下は通常速度
    kHeight += deltaTime * currentSpeed;
    if (kHeight >= targetHeight) {
      kHeight = targetHeight;
      kStatus = kHeight === 450 ? "up" : "stopped";
    }
  }

  next.koseri = {
    ...next.koseri,
    currentHeight: kHeight,
    status: kStatus,
  };

  return { nextState: next, isChanged };
};