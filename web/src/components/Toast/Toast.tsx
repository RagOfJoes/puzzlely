import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import { resolveValue } from "react-hot-toast";
import type { IconBaseProps } from "react-icons";
import { CgSpinner } from "react-icons/cg";
import {
  IoAlertCircle,
  IoCheckmarkCircle,
  IoInformationCircle,
} from "react-icons/io5";

import type { ToastProps } from "./types";

const commonIconProps: IconBaseProps = {
  size: 24,
};

export const Toast = forwardRef<ElementRef<typeof Primitive.div>, ToastProps>(
  (props, ref) => {
    return (
      <Primitive.div
        ref={ref}
        aria-live="polite"
        className={clsx(
          "group pointer-events-none flex w-full max-w-sm rounded-lg bg-base shadow",

          {
            "animate-toasterEnter": props.visible,
            "animate-toasterLeave": !props.visible,
          }
        )}
        data-type={props.type}
        role="status"
        tabIndex={0}
      >
        <div
          className={clsx(
            "flex w-full items-center gap-2 rounded-lg p-4",

            "group-data-[type=blank]:border group-data-[type=blank]:bg-surface group-data-[type=blank]:text-text",
            "group-data-[type=error]:bg-red/20 group-data-[type=error]:text-red",
            "group-data-[type=loading]:border group-data-[type=loading]:bg-surface group-data-[type=loading]:text-text",
            "group-data-[type=success]:bg-green/20 group-data-[type=success]:text-green"
          )}
        >
          {(() => {
            switch (props.type) {
              case "error":
                return (
                  <IoAlertCircle
                    {...commonIconProps}
                    className="shrink-0 fill-red"
                  />
                );
              case "loading":
                return (
                  <CgSpinner
                    {...commonIconProps}
                    className="shrink-0 animate-spin fill-text"
                  />
                );
              case "success":
                return (
                  <IoCheckmarkCircle
                    {...commonIconProps}
                    className="shrink-0 fill-green"
                  />
                );
              default:
                return (
                  <IoInformationCircle
                    {...commonIconProps}
                    className="shrink-0 fill-text"
                  />
                );
            }
          })()}

          <p className="text-sm font-semibold">
            {resolveValue(props.message, props)}
          </p>
        </div>
      </Primitive.div>
    );
  }
);

Toast.displayName = "Toast";
