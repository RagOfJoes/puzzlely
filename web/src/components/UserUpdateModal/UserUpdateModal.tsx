import { Children, forwardRef, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { IoClose } from "react-icons/io5";

import {
  FormControl,
  FormControlError,
  FormControlHelper,
  FormControlLabel,
} from "@/components/FormControl";
import { Input } from "@/components/Input";
import type { UserUpdatePayload } from "@/types/user";

import { userUpdateSchema } from "./schema";
import type { UserUpdateModalProps } from "./types";

export const UserUpdateModal = forwardRef<HTMLDivElement, UserUpdateModalProps>(
  (props, ref) => {
    const {
      children,
      className,
      defaultValues,
      isOpen,
      onSubmit = () => {},
      toggleIsOpen,
      ...other
    } = props;

    const { formState, handleSubmit, register, reset } =
      useForm<UserUpdatePayload>({
        defaultValues,
        mode: "onChange",
        reValidateMode: "onChange",
        resolver: zodResolver(userUpdateSchema),
      });

    const trigger = useMemo(() => {
      return Children.toArray(children).find((child: any) => {
        return child?.type?.displayName === "DialogTrigger";
      });
    }, [children]);

    return (
      <Dialog.Root
        open={isOpen}
        onOpenChange={(isNewOpen) => {
          if (!isNewOpen) {
            reset();
          }

          toggleIsOpen(isNewOpen);
        }}
      >
        {trigger}

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-10 bg-base/50" />

          <Dialog.Content
            {...other}
            ref={ref}
            className={clsx(
              "fixed top-1/2 left-1/2 z-10 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-muted/20 bg-surface p-6",

              "focus:outline-none",

              className
            )}
          >
            <Dialog.Title className="text-xl font-semibold">
              Edit User Profile
            </Dialog.Title>

            <Dialog.Description className="text-sm font-medium text-subtle">
              Update your profile here. Click save when you&apos;re done.
            </Dialog.Description>

            <form
              className="mt-6"
              onSubmit={(e) => {
                toggleIsOpen(false);

                handleSubmit(onSubmit)(e);
              }}
            >
              <FormControl
                required
                invalid={!!formState.errors.username?.message}
              >
                <FormControlLabel>Username</FormControlLabel>

                <Input {...register("username")} autoComplete="off" />

                <FormControlError>
                  {formState.errors.username?.message}
                </FormControlError>
                <FormControlHelper>
                  Must be 4 - 24 characters long. Only letters and numbers are
                  allowed.
                </FormControlHelper>
              </FormControl>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={!!formState.errors.username || !formState.isDirty}
                  className={clsx(
                    "relative flex h-10 shrink-0 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

                    "active:bg-cyan/70",
                    "disabled:cursor-not-allowed disabled:bg-cyan/40",
                    "focus-visible:ring focus-visible:ring-cyan/60",
                    "hover:bg-cyan/70"
                  )}
                >
                  Save
                </button>
              </div>
            </form>

            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className={clsx(
                  "absolute top-6 right-6 flex appearance-none items-center justify-center rounded-full outline-none",

                  "focus-visible:ring"
                )}
              >
                <IoClose size={20} />
              </button>
            </Dialog.Close>
            <Dialog.Description />
            <Dialog.Close />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

UserUpdateModal.displayName = "UserUpdateModal";

export default UserUpdateModal;
