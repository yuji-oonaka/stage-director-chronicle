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