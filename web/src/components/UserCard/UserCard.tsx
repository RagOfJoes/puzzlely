import {
  Avatar,
  Box,
  Button,
  HStack,
  Icon,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { IoCreate } from 'react-icons/io5';

export type UserCardProps = {
  isEditable?: boolean;
  isLoading?: boolean;
  joined: Date;
  numOfGamesPlayed: number;
  numOfPuzzlesCreated: number;
  numOfPuzzlesLiked: number;
  onEdit?: () => void | Promise<void>;
  username: string;
};

const UserCard = (props: UserCardProps) => {
  const {
    isEditable,
    isLoading,
    joined,
    numOfGamesPlayed,
    numOfPuzzlesCreated,
    numOfPuzzlesLiked,
    onEdit = () => {},
    username,
  } = props;

  return (
    <Box p="4" bg="surface" boxShadow="sm" borderRadius="lg">
      <HStack w="100%" justify="space-between">
        <HStack>
          <Avatar
            size="md"
            name={username}
            color="background"
            textTransform="none"
            borderColor="surface"
            bgGradient="linear(to-br, primary, secondary)"
          />
          <Text fontSize="lg" fontWeight="bold">
            {username}
          </Text>
        </HStack>
        {isEditable && (
          <Button
            size="sm"
            variant="link"
            colorScheme="gray"
            onClick={onEdit}
            leftIcon={<Icon as={IoCreate} />}
          >
            Edit
          </Button>
        )}
      </HStack>

      <VStack mt="4">
        {[
          { title: 'Games Played', body: numOfGamesPlayed },
          { title: 'Puzzles Created', body: numOfPuzzlesCreated },
          { title: 'Puzzles Liked', body: numOfPuzzlesLiked },
        ].map(({ body, title }) => {
          return (
            <HStack
              w="100%"
              justify="space-between"
              key={`User__${username}__Stats__${title}`}
            >
              <Text fontSize="sm" fontWeight="semibold" color="text.secondary">
                {title}
              </Text>
              <Skeleton isLoaded={!isLoading}>
                <Text fontSize="sm" color="text.primary" fontWeight="semibold">
                  {isLoading ? '0000000' : body}
                </Text>
              </Skeleton>
            </HStack>
          );
        })}
        <HStack
          w="100%"
          justify="space-between"
          key={`User__${username}__Stats__Joined`}
        >
          <Text fontSize="sm" fontWeight="semibold" color="text.secondary">
            Joined
          </Text>
          <Skeleton isLoaded={!isLoading}>
            <Text
              as="time"
              fontSize="sm"
              color="text.primary"
              fontWeight="semibold"
              dateTime={dayjs(joined).tz().toISOString()}
            >
              {dayjs(joined).tz().format('MMM DD, YYYY')}
            </Text>
          </Skeleton>
        </HStack>
      </VStack>
    </Box>
  );
};

export default UserCard;
