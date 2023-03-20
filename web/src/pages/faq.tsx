import type { GetServerSideProps } from "next";
import type { FAQPageJsonLdProps } from "next-seo";
import { FAQPageJsonLd, NextSeo } from "next-seo";

import { FAQContainer } from "@/containers/FAQ";
import { DocLayout } from "@/layouts/Doc";
import { FAQ } from "@/lib/constants";
import getColorModeCookie from "@/lib/getColorModeCookie";

function FAQPage() {
  return (
    <>
      <DocLayout title="Common Questions">
        <FAQContainer />
      </DocLayout>

      <NextSeo title="F.A.Q" />
      <FAQPageJsonLd
        mainEntity={
          FAQ.map((section) =>
            section.questions.map((object) => ({
              questionName: object.question,
              acceptedAnswerText: object.answer,
            }))
          ).flat() satisfies FAQPageJsonLdProps["mainEntity"]
        }
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {
      colorMode: getColorModeCookie(ctx.req.cookies),
    },
  };
};

export default FAQPage;
