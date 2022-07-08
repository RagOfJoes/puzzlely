import { Box, Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { IoArrowForward } from 'react-icons/io5';

import JoinIcon from '../JoinIcon';

const JoinBanner = () => {
  return (
    <Box
      py="6"
      as="section"
      bg="surface"
      maxH="300px"
      display="flex"
      boxShadow="sm"
      borderRadius="lg"
      position="relative"
      px={{ base: '4', md: '6', lg: '12' }}
    >
      <Flex
        align="start"
        justify="center"
        direction="column"
        w={{ base: '100%', md: '60%' }}
      >
        <Heading size="md">Create, play, and, share brilliant puzzles</Heading>
        <Text mt="2" fontSize="lg" color="text.secondary">
          Join{' '}
          <Text as="span" color="primary" fontWeight="bold">
            puzzlely.io
          </Text>{' '}
          now to create and share amazing puzzles. Challenge friends and other
          users to see how you stack up against them.
        </Text>
        <Link passHref href="/signup">
          <Button
            as="a"
            size="md"
            mt={{ base: '4', md: '8' }}
            ml={{ base: 'auto', md: '0' }}
            rightIcon={<Icon as={IoArrowForward} />}
          >
            Get Started
          </Button>
        </Link>
      </Flex>

      <Icon
        h="auto"
        maxH="225px"
        as={JoinIcon}
        aria-label="Join now"
        w={{ base: '0', md: '40%' }}
        display={{ base: 'none', md: 'block' }}
      />
    </Box>
  );
};

export default JoinBanner;
