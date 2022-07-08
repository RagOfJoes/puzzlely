import {
  Box,
  Divider,
  Heading,
  Icon,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Tab,
  TabList,
  Tabs,
  Text,
  useColorMode,
  Wrap,
} from '@chakra-ui/react';
import Link from 'next/link';
import { IoSettings } from 'react-icons/io5';

const Settings = () => {
  const { colorMode = 'light', setColorMode } = useColorMode();

  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <IconButton
          variant="ghost"
          colorScheme="gray"
          aria-label="Open Settings"
          icon={<Icon as={IoSettings} />}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontSize="md" fontWeight="semibold">
          Settings
        </PopoverHeader>
        <PopoverBody>
          <Box>
            <Heading size="xs" fontWeight="semibold" color="text.secondary">
              Appearance
            </Heading>
            <Divider my="2" />
            <Tabs
              mt="4"
              isFitted
              size="sm"
              variant="soft-rounded"
              aria-label="Change App Appearance"
              defaultIndex={colorMode === 'dark' ? 1 : 0}
              onChange={(index) => {
                if (index > 0) {
                  setColorMode('dark');
                  return;
                }
                setColorMode('light');
              }}
            >
              <TabList w="100%">
                <Tab aria-label="Switch to Light Mode">Light</Tab>
                <Tab aria-label="Switch to Dark Mode">Dark</Tab>
              </TabList>
            </Tabs>
          </Box>
        </PopoverBody>
        <PopoverFooter>
          <Wrap justify="center">
            <Link passHref href="/faq">
              <Text
                as="a"
                fontSize="xs"
                fontWeight="medium"
                color="text.secondary"
              >
                F.A.Q
              </Text>
            </Link>
            <Text fontSize="xs" fontWeight="medium" color="text.secondary">
              &bull;
            </Text>
            <Link passHref href="/privacy">
              <Text
                as="a"
                fontSize="xs"
                fontWeight="medium"
                color="text.secondary"
              >
                Privacy Policy
              </Text>
            </Link>
          </Wrap>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default Settings;
