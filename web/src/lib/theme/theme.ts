import { extendTheme } from '@chakra-ui/react';

import components from './components';
import foundations from './foundations';
import global from './global';

const theme = extendTheme(foundations, global, components);

export default theme;
