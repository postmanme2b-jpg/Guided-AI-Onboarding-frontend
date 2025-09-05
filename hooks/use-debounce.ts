"use client"

import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // This cleanup function will clear the timeout if the value changes
    // before the delay has passed, effectively resetting the debounce timer.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // This effect re-runs only if the value or delay changes.

  return debouncedValue;
}
