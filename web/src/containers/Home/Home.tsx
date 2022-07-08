import Main from '@/layouts/Main';

import Banner from './Banner';
import MostLiked from './MostLiked';
import MostPlayed from './MostPlayed';

const HomeContainer = () => {
  return (
    <Main breadcrumbLinks={[{ path: '/', title: 'Home' }]}>
      <Banner />

      <MostPlayed />
      <MostLiked />
    </Main>
  );
};

export default HomeContainer;
