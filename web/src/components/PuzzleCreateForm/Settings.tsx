import clsx from "clsx";
import { Controller, useFormContext } from "react-hook-form";

import {
  FormControl,
  FormControlError,
  FormControlLabel,
} from "@/components/FormControl";
import {
  NumberInput,
  NumberInputDecrementButton,
  NumberInputField,
  NumberInputIncrementButton,
  NumberInputStepper,
} from "@/components/NumberInput";
import { PuzzleFormCard } from "@/components/PuzzleFormCard";
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from "@/lib/constants";
import omit from "@/lib/omit";
import { millisecondsTo } from "@/lib/time";
import type { PuzzleCreatePayload } from "@/types/puzzle";

function Settings() {
  const { control, formState, setValue } =
    useFormContext<PuzzleCreatePayload>();
  const { errors } = formState;

  return (
    <PuzzleFormCard
      caption="Fields that restricts what player's can configure about their game."
      title="Settings"
    >
      <div className="flex flex-col items-start gap-2">
        <Controller
          control={control}
          name="maxAttempts"
          render={({ field }) => (
            <FormControl
              className="w-full"
              invalid={!!errors.maxAttempts?.message}
            >
              <FormControlLabel>Max Attempts</FormControlLabel>

              <NumberInput
                {...omit(field, ["onBlur", "onChange", "ref"])}
                max={999}
                min={0}
                onChange={(_, newValue) => {
                  setValue(
                    "maxAttempts",
                    Number.isNaN(newValue) ? 0 : newValue
                  );
                }}
              >
                <NumberInputField ref={field.ref} onBlur={field.onBlur} />

                <NumberInputStepper>
                  <NumberInputIncrementButton />
                  <NumberInputDecrementButton />
                </NumberInputStepper>
              </NumberInput>

              <FormControlError>{errors.maxAttempts?.message}</FormControlError>
            </FormControl>
          )}
        />

        <button
          onClick={() => setValue("maxAttempts", UNLIMITED_MAX_ATTEMPTS)}
          className={clsx(
            "relative inline-flex select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold outline-none transition",

            "focus-visible:ring",
            "hover:underline"
          )}
        >
          Unlimited Attempts
        </button>
      </div>

      <h4 className="text-md mt-4 font-heading font-bold">Time Limit</h4>
      <p className="text-sm font-medium text-subtle">
        Fields that restricts what player&apos;s can configure about their game.
      </p>
      <hr className="mb-4 mt-2 h-[1px] w-full bg-muted/20" />

      <div className="flex flex-col items-start gap-2">
        <div className="flex w-full gap-2">
          <Controller
            control={control}
            name="timeAllowed"
            render={({ field }) => (
              <FormControl className="w-full">
                <FormControlLabel>Minutes</FormControlLabel>

                <NumberInput
                  {...omit(field, ["onBlur", "onChange", "ref"])}
                  max={59}
                  min={0}
                  onChange={(_, newValue) => {
                    let clamped = newValue;
                    if (newValue > 59) {
                      clamped = 59;
                    }

                    const secToMs =
                      millisecondsTo("seconds", field.value) * 1000;
                    const newTime = secToMs + clamped * 60000;

                    setValue(
                      "timeAllowed",
                      Number.isNaN(newTime) ? secToMs : newTime
                    );
                  }}
                  value={millisecondsTo("minutes", field.value)}
                >
                  <NumberInputField ref={field.ref} onBlur={field.onBlur} />

                  <NumberInputStepper>
                    <NumberInputIncrementButton />
                    <NumberInputDecrementButton />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="timeAllowed"
            render={({ field }) => (
              <FormControl className="w-full">
                <FormControlLabel>Seconds</FormControlLabel>

                <NumberInput
                  {...omit(field, ["onBlur", "onChange", "ref"])}
                  min={0}
                  max={59}
                  onChange={(_, newValue) => {
                    let clamped = newValue;
                    if (newValue > 59) {
                      clamped = 59;
                    }

                    const minToMs =
                      millisecondsTo("minutes", field.value) * 60000;
                    const newTime = minToMs + clamped * 1000;

                    setValue(
                      "timeAllowed",
                      Number.isNaN(newTime) ? minToMs : newTime
                    );
                  }}
                  value={millisecondsTo("seconds", field.value)}
                >
                  <NumberInputField ref={field.ref} onBlur={field.onBlur} />

                  <NumberInputStepper>
                    <NumberInputIncrementButton />
                    <NumberInputDecrementButton />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            )}
          />
        </div>

        <button
          onClick={() => setValue("timeAllowed", UNLIMITED_TIME_ALLOWED)}
          className={clsx(
            "relative inline-flex select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold outline-none transition",

            "focus-visible:ring",
            "hover:underline"
          )}
        >
          Unlimited Time
        </button>
      </div>
    </PuzzleFormCard>
  );
}

export default Settings;
