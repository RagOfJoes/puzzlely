import { Fragment } from 'react';

import { Box, Heading, Text } from '@chakra-ui/react';

import { FAQ } from '@/lib/constants';

const FAQContainer = () => {
  return (
    <>
      {FAQ.map((section) => (
        <Fragment key={section.title}>
          <Heading
            mt="12"
            size="md"
            display="inline-block"
            bgGradient="linear(359deg, primary 24%, transparent 0)"
          >
            {section.title}
          </Heading>
          {section.questions.map((object) => (
            <Box
              p="4"
              mt="6"
              borderRadius="lg"
              border="1px solid"
              borderColor="inherit"
              key={`${section.title}__${object.question}__${object.answer}`}
            >
              <Text fontSize="md" fontWeight="bold">
                {object.question}
              </Text>
              <Text mt="2" fontSize="md">
                {object.answer}
              </Text>
            </Box>
          ))}
        </Fragment>
      ))}
    </>
  );
};

export default FAQContainer;
