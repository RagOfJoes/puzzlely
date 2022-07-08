import { Heading } from '@chakra-ui/react';

import JoinBanner from '@/components/JoinBanner';
import useMe from '@/hooks/useMe';

const Banner = () => {
  const { data: me } = useMe();

  if (!me) {
    return <JoinBanner />;
  }

  return <Heading size="lg">Welcome back {me.username}!</Heading>;
};

export default Banner;
