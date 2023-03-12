import type {
  SelectContentProps as RadixSelectContentProps,
  SelectItemProps as RadixSelectItemProps,
  SelectProps as RadixSelectProps,
  SelectTriggerProps as RadixSelectTriggerProps,
} from "@radix-ui/react-select";

export type SelectProps = RadixSelectProps & {
  className?: string;
  invalid?: boolean;
};

export type SelectTriggerProps = RadixSelectTriggerProps;

export type SelectListProps = RadixSelectContentProps;

export type SelectListItemProps = RadixSelectItemProps;
