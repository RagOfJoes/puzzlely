import { useMemo } from 'react';

import {
  Avatar,
  Box,
  Grid,
  GridItem,
  Heading,
  Icon,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { IoConstruct } from 'react-icons/io5';

import UserCard from '@/components/UserCard';
import UserUpdateModal from '@/components/UserUpdateModal';
import useMe from '@/hooks/useMe';
import useUserStats from '@/hooks/useUserStats';
import useUserUpdate from '@/hooks/useUserUpdate';
import { LOADING_DATE_PLACEHOLDER } from '@/lib/constants';
import { User } from '@/types/user';

type DetailsProps = {
  user: User;
};

const Details = (props: DetailsProps) => {
  const { user } = props;

  const toast = useToast();
  const { data: me } = useMe();
  const { mutate } = useUserUpdate();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    data: stats = { gamesPlayed: 0, puzzlesCreated: 0, puzzlesLiked: 0 },
    isLoading,
  } = useUserStats(user.id);

  const loadingTime = useMemo(
    () => dayjs(LOADING_DATE_PLACEHOLDER).tz().toDate(),
    []
  );

  return (
    <>
      <Grid
        gap="4"
        w="100%"
        autoRows="1fr"
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
      >
        <GridItem colSpan={1} rowSpan={1}>
          <UserCard
            isLoading={isLoading}
            username={user.username}
            isEditable={me && me.id === user.id}
            numOfGamesPlayed={stats.gamesPlayed}
            numOfPuzzlesLiked={stats.puzzlesLiked}
            numOfPuzzlesCreated={stats.puzzlesCreated}
            joined={isLoading ? loadingTime : user.createdAt}
            onEdit={onOpen}
          />
        </GridItem>
        <GridItem colSpan={1} rowSpan={1}>
          <Box p="4" h="100%" bg="surface" boxShadow="sm" borderRadius="md">
            <Heading size="sm">Achievements</Heading>
            <VStack h="100%" justify="center">
              <Avatar
                size="md"
                bg="primary"
                color="surface"
                icon={<Icon as={IoConstruct} />}
              />
              <Text fontSize="md" fontWeight="bold">
                Coming Soon!
              </Text>
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {!!me && me.id === user.id && (
        <UserUpdateModal
          isOpen={isOpen}
          initialValues={{ username: me.username }}
          onClose={onClose}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(true);

            mutate(
              { updates: values },
              {
                onError: (error) => {
                  toast({
                    duration: 3000,
                    status: 'error',
                    title: `Failed to edit profile: ${error.message}`,
                  });
                },
                onSettled: () => {
                  setSubmitting(false);
                },
              }
            );

            onClose();
          }}
        />
      )}
    </>
  );
};

export default Details;
