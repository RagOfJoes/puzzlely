import { useState } from 'react';

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useRouter } from 'next/router';

import { User } from '@/types/user';

import Details from './Details';
import Games from './Games';
import Puzzles from './Puzzles';

export type UserContainerProps = {
  user: User;
};

const UserContainer = (props: UserContainerProps) => {
  const { user } = props;

  const { query, replace } = useRouter();

  const [tab, setTab] = useState(() => {
    switch (query?.tab) {
      case 'games':
        return 1;
      default:
        return 0;
    }
  });

  return (
    <>
      <Details user={user} />
      <Tabs
        isLazy
        mt="12"
        index={tab}
        variant="soft-rounded"
        onChange={(index) => {
          const newTab = index === 1 ? 'games' : 'puzzles';

          setTab(index);
          replace({ query: { ...query, tab: newTab } }, undefined, {
            scroll: false,
            shallow: true,
          });
        }}
      >
        <TabList bg="transparent">
          <Tab
            _selected={{
              bg: 'surface',
              boxShadow: 'sm',
              color: 'text.primary',
            }}
          >
            Puzzles
          </Tab>
          <Tab
            _selected={{
              bg: 'surface',
              boxShadow: 'sm',
              color: 'text.primary',
            }}
          >
            Games
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px="0">
            <Puzzles user={user} />
          </TabPanel>
          <TabPanel px="0">
            <Games user={user} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default UserContainer;
