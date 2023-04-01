import { Fragment } from "react";

import clsx from "clsx";

import { FAQ } from "@/lib/constants";

export function FAQContainer() {
  return (
    <>
      {FAQ.map((section) => (
        <Fragment key={section.title}>
          <h2
            className={clsx(
              "relative mt-12 inline-block font-heading text-xl font-bold leading-none",

              'before:absolute before:bottom-0 before:left-0 before:right-0 before:z-[-1] before:h-1.5 before:bg-cyan before:opacity-80 before:content-[""]'
            )}
          >
            {section.title}
          </h2>

          {section.questions.map((question) => (
            <div
              className="mt-6 rounded-lg border p-4"
              key={`${section.title}__${question.question}__${question.answer}`}
            >
              <p className="font-bold">{question.question}</p>
              <p className="mt-2 font-medium">{question.answer}</p>
            </div>
          ))}
        </Fragment>
      ))}
    </>
  );
}
