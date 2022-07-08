import { ReactNode } from 'react';

import { HStack, Text, VStack, Box } from '@chakra-ui/react';

export type GameStatCardProps = {
  body: string;
  helperText?: string;
  icon: ReactNode;
  label: string;
};

const GameStatCard = (props: GameStatCardProps) => {
  const { label, body } = props;

  const boxShadow = '0px 7px 11px rgba(0, 0, 0, 0.04)';

  return (
    <HStack
      px="3"
      py="4"
      w="100%"
      bg="surface"
      borderRadius="lg"
      align="flex-start"
      boxShadow={boxShadow}
      justify="space-between"
    >
      <VStack spacing=".1rem" align="flex-start" justify="flex-end">
        <Text color="text.secondary" fontSize="sm" fontWeight="semibold">
          {label}
        </Text>
        <HStack>
          <Text
            fontSize="md"
            lineHeight="none"
            fontWeight="semibold"
            color="text.primary"
          >
            {body}
          </Text>
          {props?.helperText && (
            <Text
              fontSize="sm"
              lineHeight="none"
              fontWeight="semibold"
              color="text.secondary"
            >
              {props.helperText}
            </Text>
          )}
        </HStack>
      </VStack>

      <Box
        fontSize="md"
        display="flex"
        color="surface"
        bgColor="primary"
        borderRadius="full"
        alignItems="center"
        justifyContent="center"
        w={{
          base: '40px',
          md: '45px',
        }}
        h={{
          base: '40px',
          md: '45px',
        }}
      >
        {props.icon}
      </Box>
    </HStack>
  );
};

export default GameStatCard;
