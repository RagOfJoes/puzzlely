import { forwardRef, useImperativeHandle } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { TagInputProvider } from "./Context";
import type { TagInputProps, TagInputRefMethods } from "./types";
import useTagInput from "./useTagInput";

export const TagInput = forwardRef<TagInputRefMethods, TagInputProps>(
  (props, ref) => {
    const ctx = useTagInput(props);
    const { children, removeItem } = ctx;

    useImperativeHandle(ref, () => ({
      removeItem,
    }));

    return (
      <TagInputProvider value={ctx}>
        <Primitive.div className="w-full">{children}</Primitive.div>
      </TagInputProvider>
    );
  }
);

TagInput.displayName = "TagInput";
