import { memo, useEffect, useMemo } from 'react';

import {
  HStack,
  Icon,
  IconButton,
  Kbd,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { IoFlag, IoRefresh, IoShuffle } from 'react-icons/io5';

import { off, on } from '@/lib/hookUtils';

import { ShortcutsProps } from '../types';

const Shortcuts = (props: ShortcutsProps) => {
  const { game, onForfeit, onReset, onShuffle } = props;
  const { startedAt, guessedAt, completedAt } = game;
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // If `guessedAt` or `completedAt` is set then shortcuts are useless so just exit early
      if (!!guessedAt || !!completedAt) {
        return;
      }

      switch (e.key) {
        case '[':
          onReset();
          break;
        case ']':
          onShuffle();
          break;
        case '?':
          onOpen();
          break;
        case 'Q':
          onForfeit();
          break;
        default:
          break;
      }
    };

    on(window, 'keydown', handler);
    return () => {
      off(window, 'keydown', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReset, onShuffle]);

  const isDisabled = useMemo(
    () => !startedAt || !!guessedAt || !!completedAt,
    [completedAt, guessedAt, startedAt]
  );

  const buttonHoverBg = useColorModeValue('gray.200', 'whiteAlpha.300');

  return (
    <>
      <VStack w="100%" spacing="3" align="flex-start">
        <Text fontSize="sm" color="text.secondary">
          <Text as="strong" fontWeight="bold">
            Pro Tip
          </Text>
          : Press <Kbd>?</Kbd> for hotkeys
        </Text>
        <HStack w="100%" justify="flex-start">
          <IconButton
            bg="surface"
            colorScheme="gray"
            isDisabled={isDisabled}
            aria-label="Restart game"
            icon={<Icon as={IoRefresh} />}
            _disabled={{
              opacity: 1,
            }}
            _hover={{
              bg: buttonHoverBg,
              '&[disabled]': {
                bg: 'surface',
              },
            }}
            onClick={onReset}
          />
          <IconButton
            bg="surface"
            colorScheme="gray"
            isDisabled={isDisabled}
            aria-label="Shuffle blocks"
            icon={<Icon as={IoShuffle} />}
            _disabled={{
              opacity: 1,
            }}
            _hover={{
              bg: buttonHoverBg,
              '&[disabled]': {
                bg: 'surface',
              },
            }}
            onClick={onShuffle}
          />
          <IconButton
            bg="surface"
            colorScheme="gray"
            aria-label="Forfeit"
            isDisabled={isDisabled}
            icon={<Icon as={IoFlag} />}
            _disabled={{
              opacity: 1,
            }}
            _hover={{
              bg: buttonHoverBg,
              '&[disabled]': {
                bg: 'surface',
              },
            }}
            onClick={onForfeit}
          />
        </HStack>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Hotkeys</ModalHeader>
          <ModalBody pb="4">
            <VStack w="100%">
              <HStack w="100%" justify="space-between">
                <Text fontSize="sm" color="text.secondary">
                  Hotkeys
                </Text>
                <Kbd>?</Kbd>
              </HStack>
              <HStack w="100%" justify="space-between">
                <Text fontSize="sm" color="text.secondary">
                  Reset game
                </Text>
                <Kbd>[</Kbd>
              </HStack>
              <HStack w="100%" justify="space-between">
                <Text fontSize="sm" color="text.secondary">
                  Shuffle blocks
                </Text>
                <Kbd>]</Kbd>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default memo(Shortcuts);
