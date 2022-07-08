import { Box, BoxProps } from '@chakra-ui/react';
import { motion, Variants } from 'framer-motion';

const variants: Variants = {
  initial: {
    y: -40,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    y: 40,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const GameMenuCard = (props: BoxProps) => {
  return (
    <Box
      top="0"
      w="100%"
      h="100%"
      display="flex"
      alignItems="center"
      position="absolute"
      justifyContent="center"
    >
      <Box
        p="5"
        w="90%"
        maxH="90%"
        maxW="350px"
        bg="surface"
        boxShadow="lg"
        as={motion.div}
        overflowY="auto"
        borderRadius="lg"
        // Animations
        exit="exit"
        animate="animate"
        initial="initial"
        variants={variants}
        {...props}
      >
        {props.children}
      </Box>
    </Box>
  );
};

export default GameMenuCard;
