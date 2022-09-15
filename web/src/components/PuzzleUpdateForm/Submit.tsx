import { useRef } from 'react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  HStack,
  Icon,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import { IoTrash } from 'react-icons/io5';

import PuzzleFormCard from '@/components/PuzzleFormCard';
import { PuzzleUpdatePayload } from '@/types/puzzle';

import { PuzzleUpdateFormProps } from './types';

const Submit = (
  props: Pick<PuzzleUpdateFormProps, 'isDeleting' | 'onDelete'>
) => {
  const { isDeleting, onDelete = () => {} } = props;

  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { dirty, isSubmitting, isValid } =
    useFormikContext<PuzzleUpdatePayload>();

  return (
    <>
      <PuzzleFormCard mt="6" hideDivider>
        <HStack w="100%" justify="space-between">
          <IconButton
            variant="ghost"
            colorScheme="gray"
            isLoading={isDeleting}
            aria-label="Delete puzzle"
            onClick={onOpen}
            icon={<Icon as={IoTrash} />}
          />
          <Button
            w="100%"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!dirty || isDeleting || !isValid}
          >
            Update Puzzle
          </Button>
        </HStack>
      </PuzzleFormCard>

      <AlertDialog
        isCentered
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete Puzzle</AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete this puzzle? You won&apos;t be able
            to undo this action.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              variant="ghost"
              colorScheme="gray"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              ml="2"
              onClick={() => {
                onClose();
                onDelete();
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Submit;
