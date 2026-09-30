// src/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * Debounces a value by a specified delay.
 * Useful for search inputs to prevent excessive API calls.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}