import { JoinBanner } from "@/components/JoinBanner";
import useMe from "@/hooks/useMe";

function Banner() {
  const { data: me } = useMe();

  if (!me) {
    return (
      <section>
        <JoinBanner />
      </section>
    );
  }

  return (
    <h2 className="font-heading text-3xl font-bold">Welcome {me.username}!</h2>
  );
}

export default Banner;
