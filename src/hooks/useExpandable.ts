import { useState } from 'react';

export const useExpandable = (initialState = false) => {
  const [expanded, setExpanded] = useState(initialState);
  const toggle = () => setExpanded((prev) => !prev);
  
  return { expanded, toggle };
};