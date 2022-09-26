import { Box, Heading, VStack } from '@chakra-ui/react';

import Separator from '@/components/Separator';

import styles from './styles';
import { SidebarProps } from './types';

const Sidebar = (props: SidebarProps) => {
  const { children, containerProps, icon, name, ...rest } = props;

  return (
    <Box as="nav" __css={styles.container} {...containerProps}>
      <Box __css={styles.root} {...rest}>
        <Box __css={styles.link} as="a" href="/" className="chakra-link">
          {icon && icon}
          <Heading {...(styles.linkHeading as any)}>{name}</Heading>
        </Box>

        <Separator />

        {/* Height is calculated via container's paddingY + Icon height + Divider height */}
        <VStack mt="25px" h="calc(100% - 75px)">
          {children}
        </VStack>
      </Box>
    </Box>
  );
};

export default Sidebar;
