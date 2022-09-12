import { ColorMode, ColorModeProviderProps } from '@chakra-ui/system';

import { COLOR_MODE_COOKIE } from './constants';
import { isBrowser } from './hookUtils';

const path = '/';
const sameSite = 'Lax';
const maxAge = '31536000';
const isProd = process.env.NODE_ENV === 'production';

const regExp = new RegExp(`(^| )${COLOR_MODE_COOKIE}=([^;]+)`);
const match = (cookie: string, init?: ColorMode): ColorMode | undefined => {
  return (cookie.match(regExp)?.[2] as ColorMode | undefined) ?? init;
};

const colorModeManager = (
  cookies?: string
): ColorModeProviderProps['colorModeManager'] => {
  return {
    ssr: true,
    type: 'cookie',
    get: (init?) => {
      return match(isBrowser ? document.cookie : cookies || '', init);
    },
    set: (value) => {
      if (!isBrowser) {
        return;
      }

      const cookie = `${COLOR_MODE_COOKIE}=${value}; Path=${path}; SameSite=${sameSite}; Max-Age=${maxAge}${
        isProd ? '; Secure' : ''
      }`;

      document.cookie = cookie;
    },
  };
};

export default colorModeManager;
