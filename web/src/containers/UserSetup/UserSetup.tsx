import { UserSetupForm } from "@/components/UserSetupForm";
import useUserUpdate from "@/hooks/useUserUpdate";

export function UserSetupContainer() {
  const { mutateAsync } = useUserUpdate();

  return (
    <div className="mt-6 flex w-full items-start justify-center">
      <UserSetupForm
        onSubmit={async (values) => {
          await mutateAsync({ updates: values });
        }}
      />
    </div>
  );
}
