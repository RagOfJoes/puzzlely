import type { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";

import { PrivacyContainer } from "@/containers/Privacy";
import { DocLayout } from "@/layouts/Doc";
import getColorModeCookie from "@/lib/getColorModeCookie";

function PrivacyPage() {
  return (
    <>
      <DocLayout title="Privacy Policy">
        <PrivacyContainer />
      </DocLayout>

      <NextSeo title="Privacy Policy" />
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

export default PrivacyPage;
