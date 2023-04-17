import { useState } from "react";

import clsx from "clsx";
import { toast } from "react-hot-toast";
import { IoConstruct } from "react-icons/io5";

import { UserCard } from "@/components/UserCard";
import useMe from "@/hooks/useMe";
import useUserStats from "@/hooks/useUserStats";
import useUserUpdate from "@/hooks/useUserUpdate";
import type { User } from "@/types/user";

const Details = (props: { user: User }) => {
  const { user } = props;

  const { data: me } = useMe();
  const { mutate } = useUserUpdate();
  const [isOpen, toggleIsOpen] = useState(false);
  const {
    data: stats = { gamesPlayed: 0, puzzlesCreated: 0, puzzlesLiked: 0 },
    isLoading,
  } = useUserStats(user.id);

  return (
    <section
      className={clsx(
        "grid w-full auto-rows-fr grid-cols-2 gap-4",

        "max-md:grid-cols-1"
      )}
    >
      <div className="col-span-1 row-span-1">
        <UserCard
          isEditable={me && me.id === user.id}
          isLoading={isLoading}
          isOpen={isOpen}
          onEdit={(data) => {
            mutate(
              {
                updates: data,
              },
              {
                onError: (error) => {
                  toast.error(`Failed to edit profile: ${error.message}`);
                },
              }
            );

            toggleIsOpen(false);
          }}
          stats={stats}
          togglsIsOpen={toggleIsOpen}
          user={user}
        />
      </div>

      <div className="col-span-1 row-span-1">
        <div className="h-full w-full rounded-lg border bg-surface p-4">
          <h2 className="font-heading font-bold">Achievements</h2>

          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan">
              <div
                role="img"
                aria-label="Achievements"
                className="text-xl font-medium text-surface"
              >
                <IoConstruct />
              </div>
            </span>

            <p className="font-bold">Coming Soon!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Details;
