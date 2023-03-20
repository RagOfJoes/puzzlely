import { UserSetupForm } from "@/components/UserSetupForm";
import useUserUpdate from "@/hooks/useUserUpdate";

export function UserSetupContainer() {
  const { mutate } = useUserUpdate();

  return (
    <div className="mt-6 flex w-full items-start justify-center">
      <UserSetupForm
        onSubmit={(values) => {
          mutate(
            { updates: values },
            {
              onError: (error) => {
                console.log(error);
              },
            }
          );
        }}
      />
    </div>
  );
}
