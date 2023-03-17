import { NextSeo } from "next-seo";

import { InternalErrorIcon } from "@/components/InternalErrorIcon";
import { InternalErrorContainer } from "@/containers/InternalError";
import { ErrorLayout } from "@/layouts/Error";

function InternalErrorPage() {
  return (
    <>
      <ErrorLayout
        lead="Internal Error..."
        caption="Oops! Sorry, an unexpected error occurred. Please try again later."
        icon={
          <InternalErrorIcon
            aria-label="Internal Error"
            className="h-auto max-h-64 w-full"
          />
        }
      >
        <InternalErrorContainer />
      </ErrorLayout>

      <NextSeo noindex nofollow title="Oops!" />
    </>
  );
}

export default InternalErrorPage;
