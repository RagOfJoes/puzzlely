export type Status = "RUNNING" | "PAUSED" | "STOPPED";

export type TimerType = "DECREMENTAL" | "INCREMENTAL";

export type UseTimerParam = {
  autostart: boolean;
  endTime: number | null;
  initialStatus: Status;
  interval: number;
  onTimeOver?: () => void;
  onTimeUpdate?: (time: number) => void;
  startTime: number;
  step: number;
  timerType: TimerType;
};

export type UseTimerReturn = {
  advanceTime: (timeToAdd: number) => void;
  pause: () => void;
  reset: () => void;
  resetTo: (newTime: number, shouldAutostart: boolean) => void;
  start: () => void;
  status: Status;
  time: number;
};
