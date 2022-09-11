import { NextSeo } from 'next-seo';

import PrivacyContainer from '@/containers/Privacy';
import DocLayout from '@/layouts/Doc';

const PrivacyPage = () => {
  return (
    <>
      <DocLayout title="Privacy Policy">
        <PrivacyContainer />
      </DocLayout>

      <NextSeo title="Privacy Policy" />
    </>
  );
};

export default PrivacyPage;
