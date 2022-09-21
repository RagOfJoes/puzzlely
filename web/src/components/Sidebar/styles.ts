import { SystemStyleObject } from '@chakra-ui/system';

const styles: Record<
  | 'container'
  | 'itemButton'
  | 'itemIcon'
  | 'itemSection'
  | 'itemText'
  | 'link'
  | 'linkHeading'
  | 'root',
  SystemStyleObject
> = {
  container: {
    pt: '40px',
    pb: '25px',
    h: '100vh',
    w: '260px',
    ps: '20px',
    pe: '20px',
    left: '0px',
    flex: '1 1 0px',
    position: 'fixed',
    overflow: 'hidden auto',

    display: {
      xs: 'none',
      lg: 'block',
    },
  },
  itemButton: {
    w: '100%',
    h: '54px',
    py: '12px',
    cursor: 'pointer',
    borderRadius: '15px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    transition: '0.12s linear all',

    mb: { xl: '12px' },
    mx: { xl: 'auto' },

    _active: {
      bg: 'inhreit',
      transform: 'none',
      borderColor: 'transparent',
    },
  },
  itemIcon: {
    w: '30px',
    h: '30px',
    me: '12px',
    borderRadius: '8px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSection: {
    w: '100%',
    pt: '12px',
    size: 'xs',
    color: 'text.primary',
    textTransform: 'uppercase',

    ps: { sm: '10px', xl: '16px' },
  },
  itemText: {
    my: 'auto',
    fontSize: 'sm',
    fontWeight: 'semibold',
  },
  link: {
    px: '4',
    mb: '25px',
    display: 'flex',
    textDecor: 'none',
    alignItems: 'center',

    _focus: {
      boxShadow: 'none',
    },
    _hover: {
      textDecor: 'none',
    },
  },
  linkHeading: {
    ms: '12px',
    fontSize: 'lg',
    position: 'relative',

    _before: {
      left: 0,
      right: 2.5,
      zIndex: -1,
      bottom: 0.3,
      opacity: 0.6,
      content: '""',
      height: '6px',
      position: 'absolute',
      backgroundColor: 'primary',
    },
  },
  root: {
    h: '100%',
    bg: 'none',
    borderRadius: 'md',
    transition: '0.2s linear',
  },
};

export default styles;
