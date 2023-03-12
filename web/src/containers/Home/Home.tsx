import Banner from "./Banner";
import MostLiked from "./MostLiked";
import MostPlayed from "./MostPlayed";

export function HomeContainer() {
  return (
    <article>
      <div className="block">
        <Banner />

        <MostPlayed />
        <MostLiked />
      </div>
    </article>
  );
}
