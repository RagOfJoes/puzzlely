import { useMemo } from 'react';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';

import GameAttemptCard from '@/components/GameAttemptCard';
import { Block } from '@/types/puzzle';

import { ResultMenuProps } from '../../types';

const Attempts = (
  props: Pick<ResultMenuProps, 'blocks'> &
    Pick<ResultMenuProps['game'], 'attempts'>
) => {
  const { attempts, blocks } = props;

  const blocksMap = useMemo(() => {
    const map: { [blockID: string]: Block } = {};
    blocks.forEach((block) => {
      if (!map[block.id]) {
        map[block.id] = block;
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Accordion w="100%" allowToggle>
      <AccordionItem border="none">
        <AccordionButton
          w="100%"
          padding="0"
          justifyContent="space-between"
          _focus={{
            boxShadow: 'none',
          }}
          _hover={{
            bg: 'transparent',
          }}
        >
          <Heading size="xs" noOfLines={1}>
            Attempts{' '}
            <Text
              fontSize="md"
              noOfLines={1}
              fontWeight="medium"
              display="inline-flex"
              color="text.secondary"
            >
              ({attempts.length})
            </Text>
          </Heading>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel ps="0" pe="0" pb="0">
          <VStack spacing="1">
            {attempts.map((attempt, index) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const key = useMemo(() => {
                return `${attempt.join('__')}__${index}`;
                // eslint-disable-next-line react-hooks/exhaustive-deps
              }, []);
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const joined = useMemo(() => {
                return attempt.map(
                  (blockID) => blocksMap[blockID]?.value || '-'
                );
                // eslint-disable-next-line react-hooks/exhaustive-deps
              }, []);

              return <GameAttemptCard key={key} attempt={joined} />;
            })}
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default Attempts;
