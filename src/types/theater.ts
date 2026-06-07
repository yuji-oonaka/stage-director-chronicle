// 幕（緞帳・中割・引割）の共通ステート
export interface CurtainState {
  position: number;    // 現在の開閉度（0: 完全に閉じている 〜 100: 完全に開いている）
  status: 'closed' | 'opening' | 'open' | 'closing' | 'stopped';
  speedDial: number;   // 三研操作盤のダイヤル値（10% 〜 100%）
}

// 小迫り（セリ）のステート
export interface KoseriState {
  currentHeight: number; // 現在の高さ（ミリメートル表記。奈落: -1000, ぬすみ: -50, 舞台面: 0, +450: 450 など）
  status: 'down' | 'rising' | 'up' | 'falling' | 'stopped';
  targetNamedPosition: '奈落' | 'ぬすみ' | '舞台' | '+450' | 'none';
}

// 演目タイムラインのイベント定義
export interface TimelineEvent {
  id: number;
  time: number;
  type: 'BUZZER' | 'CURTAIN_MAIN' | 'KOSERI' | 'CURTAIN_MIDDLE' | 'CURTAIN_BACK' | 'SYNCHRO';
  action?: string;
  label: string;
}

// 舞台全体のリアルタイムな空間状態（親が保持）
export interface StageState {
  curtainMain: CurtainState;   // 1. 緞帳
  koseri: KoseriState;         // 2. 小迫り
  curtainMiddle: CurtainState; // 3. 中割幕
  curtainBack: CurtainState;   // 4. 渡りの引き割幕（引割緞帳）
  horizone: {
    active: boolean;
    color: string;             // ブルー、夕焼け、漆黒など
  };
  actorPresent: 'none' | 'back-stage' | 'on-stage' | 'haked'; // 役者の位置
}

// 【追加】興行の進行フェーズ定義（現場のタイムライン）
export type StagePhase = 
  | 'SETTING'       // 1. セッティング（開場前・舞台上で大道具の事前仕込み・調整を行う）
  | 'DOORS_OPEN'    // 2. 開場（客入れ・SEIKO時計は現在時刻、客席がざわつき始める）
  | 'PERFORMANCE'   // 3. 開演（本番スタート！合図とともにストップウォッチが走り出す）
  | 'INTERMISSION'  // 4. 幕間（休憩・次の幕に向けた転換・セット替え）
  | 'POST_SHOW'     // 5. 終演（バラシの準備、客席送り出し）
  | 'EXIT';         // 6. 客だし（完全撤収）