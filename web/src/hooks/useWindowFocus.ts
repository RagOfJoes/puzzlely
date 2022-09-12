import { useEffect, useState } from 'react';

const shouldFocus = typeof document !== 'undefined' && document.hasFocus();

const useWindowFocus = () => {
  // Focus for first render
  const [isFocused, toggleIsFocused] = useState(shouldFocus);

  useEffect(() => {
    toggleIsFocused(shouldFocus);

    const onFocus = () => toggleIsFocused(true);
    const onBlur = () => toggleIsFocused(false);

    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return isFocused;
};

export default useWindowFocus;
