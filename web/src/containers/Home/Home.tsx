import Banner from './Banner';
import MostLiked from './MostLiked';
import MostPlayed from './MostPlayed';

const HomeContainer = () => {
  return (
    <>
      <Banner />

      <MostPlayed />
      <MostLiked />
    </>
  );
};

export default HomeContainer;
