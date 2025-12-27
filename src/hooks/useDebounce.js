// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * Useful for search inputs to avoid excessive API calls
 * 
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {any} - Debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debounced callback
 * 
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} - Debounced callback function
 */
export const useDebouncedCallback = (callback, delay = 500, dependencies = []) => {
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const debouncedCallback = (...args) => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  return debouncedCallback;
};

export default useDebounce;