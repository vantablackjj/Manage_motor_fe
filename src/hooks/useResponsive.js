// src/hooks/useResponsive.js
import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../utils/constant';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < BREAKPOINTS.MOBILE;
  const isTablet = windowSize.width >= BREAKPOINTS.MOBILE && windowSize.width < BREAKPOINTS.TABLET;
  const isDesktop = windowSize.width >= BREAKPOINTS.TABLET;

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop
  };
};