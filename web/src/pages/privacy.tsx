import { NextSeo } from 'next-seo';

import PrivacyContainer from '@/containers/Privacy';

const PrivacyPage = () => {
  return (
    <>
      <PrivacyContainer />
      <NextSeo title="Privacy Policy" robotsProps={{ nosnippet: true }} />
    </>
  );
};

export default PrivacyPage;
