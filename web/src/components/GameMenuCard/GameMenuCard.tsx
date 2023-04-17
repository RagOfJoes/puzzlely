import { forwardRef } from "react";

import clsx from "clsx";
import type { HTMLMotionProps, Variants } from "framer-motion";
import { motion } from "framer-motion";

const variants: Variants = {
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
    y: 0,
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
    y: 40,
  },
  initial: {
    opacity: 0,
    y: -40,
  },
};

export const GameMenuCard = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  (props, ref) => {
    const { children, className, ...other } = props;

    return (
      <div className="absolute top-0 flex h-full w-full items-center justify-center">
        <motion.div
          {...other}
          ref={ref}
          animate="animate"
          className={clsx(
            "max-h-[90%] w-[90%] max-w-sm overflow-y-auto rounded-lg border bg-surface p-5 outline-none",

            "focus-visible:ring",

            className
          )}
          exit="exit"
          initial="initial"
          variants={variants}
        >
          {children}
        </motion.div>
      </div>
    );
  }
);

GameMenuCard.displayName = "GameMenuCard";
