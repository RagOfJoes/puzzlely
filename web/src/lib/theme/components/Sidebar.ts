const Sidebar = {
  parts: ['container', 'wrapper'],
  baseStyle: {
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
    wrapper: {
      h: '100%',
      bg: 'none',
      borderRadius: 'md',
      transition: '0.2s linear',
    },
  },
};

export default Sidebar;
