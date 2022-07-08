import { useCallback, useEffect, useState } from 'react';

import useInterval from '../useInterval';
import { UseTimerParam, UseTimerReturn } from './types';

const useTimer = ({
  autostart = false,
  endTime,
  initialStatus = 'STOPPED',
  startTime = 0,
  interval = 1000,
  step = 1,
  timerType = 'INCREMENTAL',
  onTimeOver,
  onTimeUpdate,
}: Partial<UseTimerParam> = {}): UseTimerReturn => {
  const [state, setState] = useState({
    status: initialStatus,
    time: startTime,
  });

  const { status, time } = state;

  const advanceTime = useCallback(
    (timeToAdd: number) => {
      setState((prev) => ({
        ...prev,
        time: timerType === 'DECREMENTAL' ? time - timeToAdd : time + timeToAdd,
      }));
    },
    [time, timerType]
  );

  const pause = useCallback(() => {
    if (status !== 'RUNNING') {
      return;
    }
    setState((prev) => ({
      ...prev,
      status: 'PAUSED',
    }));
  }, [status]);

  const reset = useCallback(() => {
    setState(() => ({
      status: 'STOPPED',
      time: startTime,
    }));
  }, [startTime]);

  const resetTo = useCallback((newTime: number, shouldAutostart: boolean) => {
    setState((prev) => ({
      status: shouldAutostart ? 'RUNNING' : prev.status,
      time: prev.status === 'STOPPED' ? newTime : prev.time,
    }));
  }, []);

  const start = useCallback(() => {
    setState((prev) => ({
      status: 'RUNNING',
      time: prev.status === 'STOPPED' ? startTime : prev.time,
    }));
  }, [startTime]);

  useEffect(() => {
    if (autostart) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof onTimeUpdate === 'function') {
      onTimeUpdate(time);
    }
  }, [time, onTimeUpdate]);

  useEffect(() => {
    if (status !== 'STOPPED' && time === endTime) {
      setState({
        time: endTime,
        status: 'STOPPED',
      });
      if (typeof onTimeOver === 'function') {
        onTimeOver();
      }
    }
  }, [endTime, onTimeOver, time, status]);

  useInterval(
    () => {
      setState((prev) => ({
        ...prev,
        time: timerType === 'DECREMENTAL' ? prev.time - step : prev.time + step,
      }));
    },
    status === 'RUNNING' ? interval : null
  );

  return { advanceTime, pause, reset, resetTo, start, status, time };
};

export default useTimer;
