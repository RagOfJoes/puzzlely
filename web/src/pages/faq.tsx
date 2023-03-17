import { FAQPageJsonLd, NextSeo } from "next-seo";

import { FAQContainer } from "@/containers/FAQ";
import { DocLayout } from "@/layouts/Doc";
import { FAQ } from "@/lib/constants";

function FAQPage() {
  return (
    <>
      <DocLayout title="Common Questions">
        <FAQContainer />
      </DocLayout>

      <NextSeo title="F.A.Q" />
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
}

export default FAQPage;
