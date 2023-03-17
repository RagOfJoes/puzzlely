import { NextSeo } from "next-seo";

import { NotFoundIcon } from "@/components/NotFoundIcon";
import { NotFoundContainer } from "@/containers/NotFound";
import { ErrorLayout } from "@/layouts/Error";

function NotFoundPage() {
  return (
    <>
      <ErrorLayout
        lead="Page Not Found..."
        caption="Hmmm... Seems you're a bit lost. Let's get you back on track."
        icon={
          <NotFoundIcon
            aria-label="Not Found"
            className="h-auto max-h-64 w-full"
          />
        }
      >
        <NotFoundContainer />
      </ErrorLayout>

      <NextSeo noindex nofollow title="Not Found" />
    </>
  );
}

export default NotFoundPage;
