import { useMemo } from 'react';

import {
  Divider,
  HStack,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';

import abbreviateNumber from '@/lib/abbreviateNumber';

export type LikeButtonProps = {
  isLiked?: boolean;
  numOfLikes?: number;
  onLike?: () => void | Promise<void>;
};

const LikeButton = (props: LikeButtonProps) => {
  const { isLiked, numOfLikes, onLike = () => {} } = props;

  const formattedNumOfLikes = useMemo(
    () => abbreviateNumber(numOfLikes || 0),
    [numOfLikes]
  );

  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.200');

  return (
    <HStack
      px="2"
      h="28px"
      as="button"
      bg="background"
      borderRadius="md"
      transition="0.2s linear"
      transitionProperty="box-shadow"
      _focus={{
        outline: 'none',
        boxShadow: 'outline',
      }}
      _hover={{
        bg: hoverBg,
      }}
      onClick={onLike}
    >
      <Icon
        color={isLiked ? 'red.300' : 'text.secondary'}
        as={isLiked ? IoHeart : IoHeartOutline}
      />
      <Text fontSize="sm" fontWeight="medium" color="text.secondary">
        {isLiked ? 'Liked' : 'Like'}
      </Text>
      <Divider orientation="vertical" />
      <Text
        fontSize="xs"
        lineHeight="shorter"
        fontWeight="semibold"
        color="text.secondary"
      >
        {formattedNumOfLikes}
      </Text>
    </HStack>
  );
};

export default LikeButton;
