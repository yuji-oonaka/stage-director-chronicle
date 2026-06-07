// タイムラインの各キュー（イベント）の定義
export interface TimelineEvent {
  id: number;
  time: number; // 開演（あるいはブザー）からのミリ秒
  type: 'BUZZER' | 'CURTAIN' | 'KOSERI' | 'SYNCHRO';
  action?: '開' | '閉' | 'S' | '昇' | '降' | 'GO';
  label: string;
}

// 舞台機構の状態（State）
export interface StageState {
  curtain: 'closed' | 'opening' | 'open' | 'closing' | 'stopped'; // 中割幕
  koseri: 'down' | 'rising' | 'up' | 'falling' | 'stopped';       // 小迫り
  horizone: boolean;                                              // ホリゾント点灯状態
  actorPresent: 'none' | 'on-stage' | 'haked';                    // 役者の位置（なし・板付き・ハケ）
}