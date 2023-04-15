import type { ElementRef } from "react";
import { forwardRef, useMemo } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import dayjs from "dayjs";
import { IoCreate } from "react-icons/io5";

import { Skeleton } from "@/components/Skeleton";
import { UserUpdateModal } from "@/components/UserUpdateModal";
import { LOADING_DATE_PLACEHOLDER } from "@/lib/constants";

import type { UserCardProps } from "./types";

export const UserCard = forwardRef<
  ElementRef<typeof Primitive.div>,
  UserCardProps
>((props, ref) => {
  const {
    className,
    isEditable,
    isLoading,
    isOpen,
    onEdit = () => {},
    stats,
    togglsIsOpen,
    user,
    ...other
  } = props;
  const { gamesPlayed, puzzlesCreated, puzzlesLiked } = stats;
  const { createdAt, username } = user;

  // Prevents hydration errors
  const joined = useMemo(() => {
    const format = "MMM DD, YYYY";

    if (isLoading) {
      return dayjs(LOADING_DATE_PLACEHOLDER).tz().format(format);
    }

    return dayjs(createdAt).tz().format(format);
  }, [createdAt, isLoading]);

  return (
    <Primitive.div
      {...other}
      ref={ref}
      className={clsx(
        "rounded-lg bg-surface p-4",

        className
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-magenta">
            <div
              role="img"
              aria-label={username}
              className="text-xl font-medium text-surface"
            >
              {username[0]}
            </div>
          </span>

          <p className="text-lg font-bold">{username}</p>
        </div>

        {isEditable && (
          <UserUpdateModal
            defaultValues={{ username }}
            isOpen={isOpen}
            onSubmit={onEdit}
            toggleIsOpen={togglsIsOpen}
          >
            <Dialog.Trigger asChild>
              <button
                onClick={() => togglsIsOpen(true)}
                className={clsx(
                  "relative inline-flex select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold outline-none transition",

                  "focus-visible:ring",
                  "hover:underline"
                )}
              >
                <IoCreate />
                Edit
              </button>
            </Dialog.Trigger>
          </UserUpdateModal>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {[
          { title: "Games Played", body: gamesPlayed },
          { title: "Puzzles Created", body: puzzlesCreated },
          { title: "Puzzles Liked", body: puzzlesLiked },
        ].map(({ body, title }) => {
          return (
            <div
              key={`User__${username}__Stats__${title}`}
              className="flex w-full items-center justify-between"
            >
              <p className="text-sm font-semibold text-subtle">{title}</p>

              <Skeleton isLoaded={!isLoading}>
                <p
                  className={clsx(
                    "text-sm font-semibold",

                    {
                      invisible: isLoading,
                    }
                  )}
                >
                  {isLoading ? "0000000" : body}
                </p>
              </Skeleton>
            </div>
          );
        })}

        <div
          key={`User__${username}__Stats__Joined`}
          className="flex w-full items-center justify-between"
        >
          <p className="text-sm font-semibold text-subtle">Joined</p>

          <Skeleton isLoaded={!isLoading}>
            <p className="text-sm font-semibold">{joined}</p>
          </Skeleton>
        </div>
      </div>
    </Primitive.div>
  );
});

UserCard.displayName = "UserCard";
