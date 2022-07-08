import { FAQPageJsonLd, NextSeo } from 'next-seo';

import FAQContainer from '@/containers/FAQ';
import { FAQ } from '@/lib/constants';

const FAQPage = () => {
  return (
    <>
      <FAQContainer />
      <NextSeo
        title="F.A.Q"
        robotsProps={{
          nosnippet: true,
        }}
      />
      <FAQPageJsonLd
        mainEntity={FAQ.map((section) =>
          section.questions.map((object) => ({
            questionName: object.question,
            acceptedAnswerText: object.answer,
          }))
        ).flat()}
      />
    </>
  );
};

export default FAQPage;
