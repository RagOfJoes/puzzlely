import { useMemo } from "react";

import clsx from "clsx";
import { IoSettings } from "react-icons/io5";

import {
  FormControl,
  FormControlHelper,
  FormControlLabel,
} from "@/components/FormControl";
import { GameMenuCard } from "@/components/GameMenuCard";
import {
  NumberInput,
  NumberInputDecrementButton,
  NumberInputField,
  NumberInputIncrementButton,
  NumberInputStepper,
} from "@/components/NumberInput";
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from "@/lib/constants";
import { millisecondsTo } from "@/lib/time";

import type { ConfigMenuProps } from "../types";

const Config = (props: ConfigMenuProps) => {
  const { game, onMenu, onStart, onUpdateTimeAllowed, setGame } = props;
  const { config, challengedBy, puzzle } = game;

  const disableAttempts = !!challengedBy || puzzle.maxAttempts > 0;
  const disableTimeAllowed = !!challengedBy || puzzle.timeAllowed > 0;

  const onUpdateTimer = (newTime: number) => {
    if (disableTimeAllowed) {
      return;
    }

    setGame((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        timeAllowed: newTime,
      },
    }));

    onUpdateTimeAllowed(newTime);
  };

  const { minutes, seconds } = useMemo(
    () => ({
      minutes: millisecondsTo("minutes", config.timeAllowed),
      seconds: millisecondsTo("seconds", config.timeAllowed),
    }),
    [config.timeAllowed]
  );

  return (
    <GameMenuCard>
      <div className="flex w-full items-center justify-between gap-6">
        <div className="flex w-full flex-col items-start justify-center">
          <h3 className="text-sm font-bold outline-none">Settings</h3>

          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Update game settings
          </p>
        </div>

        <IoSettings className="h-5 w-5" />
      </div>

      <FormControl className="mt-2" disabled={disableAttempts}>
        <FormControlLabel>Number of Attempts</FormControlLabel>

        <NumberInput
          max={999}
          min={0}
          onChange={(_, newValue) => {
            if (disableAttempts) {
              return;
            }

            setGame((prev) => ({
              ...prev,
              config: {
                ...prev.config,
                maxAttempts: Number.isNaN(newValue) ? 0 : newValue,
              },
            }));
          }}
          value={config.maxAttempts}
        >
          <NumberInputField />

          <NumberInputStepper>
            <NumberInputIncrementButton />

            <NumberInputDecrementButton />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <button
        className={clsx(
          "relative mt-2 flex select-none appearance-none items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold leading-none outline-none transition",

          "active:enabled:bg-muted/20",
          "disabled:cursor-not-allowed disabled:text-muted/60",
          "focus-visible:enabled:ring",
          "hover:enabled:underline"
        )}
        disabled={disableAttempts}
        onClick={() => {
          if (disableAttempts) {
            return;
          }

          setGame((prev) => ({
            ...prev,
            config: {
              ...prev.config,
              maxAttempts: UNLIMITED_MAX_ATTEMPTS,
            },
          }));
        }}
      >
        Unlimited Max Attempts
      </button>

      <div className="mt-4 flex w-full items-end justify-center gap-2">
        <FormControl disabled={disableTimeAllowed}>
          <FormControlLabel>Time Limit</FormControlLabel>

          <NumberInput
            max={59}
            min={0}
            onChange={(_, newValue) => {
              if (disableTimeAllowed) {
                return;
              }

              const secToMs = seconds * 1000;
              const newTime = secToMs + newValue * 60000;

              onUpdateTimer(Number.isNaN(newTime) ? secToMs : newTime);
            }}
            value={minutes}
          >
            <NumberInputField />

            <NumberInputStepper>
              <NumberInputIncrementButton />

              <NumberInputDecrementButton />
            </NumberInputStepper>
          </NumberInput>

          <FormControlHelper>minutes</FormControlHelper>
        </FormControl>

        <FormControl disabled={disableTimeAllowed}>
          <NumberInput
            min={0}
            max={59}
            value={seconds}
            onChange={(_, newValue) => {
              if (disableTimeAllowed) {
                return;
              }

              const minToMs = minutes * 60000;
              const newTime = minToMs + newValue * 1000;

              onUpdateTimer(Number.isNaN(newTime) ? minToMs : newTime);
            }}
          >
            <NumberInputField />

            <NumberInputStepper>
              <NumberInputIncrementButton />

              <NumberInputDecrementButton />
            </NumberInputStepper>
          </NumberInput>

          <FormControlHelper>seconds</FormControlHelper>
        </FormControl>
      </div>

      <button
        className={clsx(
          "relative mt-2 flex select-none appearance-none items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold leading-none outline-none transition",

          "active:enabled:bg-muted/20",
          "disabled:cursor-not-allowed disabled:text-muted/60",
          "focus-visible:enabled:ring",
          "hover:enabled:underline"
        )}
        disabled={disableTimeAllowed}
        onClick={() => {
          if (disableAttempts) {
            return;
          }

          setGame((prev) => ({
            ...prev,
            config: {
              ...prev.config,
              timeAllowed: UNLIMITED_TIME_ALLOWED,
            },
          }));
        }}
      >
        Unlimited Time Allowed
      </button>

      <div className="mt-4 flex w-full items-center justify-center gap-2">
        <button
          aria-label="Update game settings"
          className={clsx(
            "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 font-semibold outline-none transition",

            "active:bg-muted/20",
            "focus-visible:ring",
            "hover:bg-muted/10"
          )}
          onClick={onMenu}
        >
          Back
        </button>

        <button
          aria-label="Start game"
          className={clsx(
            "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

            "active:bg-cyan/70",
            "focus-visible:ring focus-visible:ring-cyan/60",
            "hover:bg-cyan/70"
          )}
          onClick={onStart}
        >
          Start
        </button>
      </div>
    </GameMenuCard>
  );
};

export default Config;
