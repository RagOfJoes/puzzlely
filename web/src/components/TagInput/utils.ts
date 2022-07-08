import { Children, ReactNode } from 'react';

import { isEmpty } from '@chakra-ui/utils';

const VALID_AUTOCOMPLETE_LIST_CHILDREN = ['TagInputCreatable'];

const escapeRegex = (string: string) => {
  return string.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const setEmphasis = (children: any, query: string) => {
  if (typeof children !== 'string' || isEmpty(query)) {
    return children;
  }
  const newChildren = children
    .toString()
    .replace(
      new RegExp(escapeRegex(query), 'gi'),
      (match: any) => `<mark>${match}</mark>`
    );
  return newChildren;
};

export const siblingInfo = (children: ReactNode) => {
  const items = Children.map(children, (child: any) => {
    return child;
  }) as ReactNode;

  const nonAutocompleteItems = Children.toArray(items).filter((child: any) => {
    return !VALID_AUTOCOMPLETE_LIST_CHILDREN.includes(child?.type?.displayName);
  });
  const autoCompleteItems = Children.toArray(items).filter((child: any) => {
    return VALID_AUTOCOMPLETE_LIST_CHILDREN.includes(child?.type?.displayName);
  });

  return [autoCompleteItems, nonAutocompleteItems] as const;
};
