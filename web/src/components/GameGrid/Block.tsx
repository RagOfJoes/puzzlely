import { forwardRef } from "react";

import clsx from "clsx";
import { motion } from "framer-motion";

import type { GameGridBlockProps } from "./types";

export const GameGridBlock = forwardRef<HTMLButtonElement, GameGridBlockProps>(
  (props, ref) => {
    const {
      children,
      className,
      isCorrect,
      isDisabled,
      isError,
      isSelected,
      ...other
    } = props;

    return (
      <motion.button
        {...other}
        ref={ref}
        className={clsx(
          "col-span-1 row-span-1 appearance-none rounded-xl border bg-surface outline-none transition-[background-color,box-shadow,color]",

          "dark:data-[selected=true]:enabled:shadow-[inset_5px_5px_10px_#0d0c12,inset_-5px_-5px_10px_#262336]",
          "data-[correct=true]:cursor-not-allowed data-[correct=true]:bg-muted/20 data-[correct=true]:text-subtle data-[correct=true]:hover:bg-muted/20",
          "data-[error=true]:enabled:bg-red data-[error=true]:enabled:text-base data-[error=true]:focus-visible:enabled:ring-red/60",
          "data-[selected=true]:border-transparent data-[selected=true]:enabled:bg-base data-[selected=true]:enabled:shadow-[inset_5px_5px_10px_#dcd6d1,inset_-5px_-5px_10px_#ffffff]",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "first-of-type:col-start-1 first-of-type:col-end-1 first-of-type:row-start-1 first-of-type:row-end-1",
          "focus-visible:enabled:ring",
          "hover:enabled:bg-muted/10",
          "motion-reduce:transition-none",

          className
        )}
        data-correct={isCorrect}
        data-disabled={isDisabled}
        data-error={isError}
        data-selected={isSelected}
        disabled={isDisabled}
        layout
        transition={{
          layout: {
            duration: 0.3,
          },
        }}
      >
        <div className="flex h-full w-full items-center justify-center p-2">
          <p className="line-clamp-4 select-none text-center font-medium leading-tight">
            {isDisabled
              ? "_".repeat(children?.toString().length || 0)
              : children}
          </p>
        </div>
      </motion.button>
    );
  }
);

GameGridBlock.displayName = "GameGridBlock";
