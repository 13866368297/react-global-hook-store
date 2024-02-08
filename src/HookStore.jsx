import { useEffect, useRef } from 'react';

export default function HookStore({ store }) {
  const mounted = useRef(false);
  const state = store.createState();
  if (!mounted.current) {
    store.setState(state);
  }
  useEffect(() => {
    if (mounted.current) {
      store.setState(state);
    } else {
      mounted.current = true;
    }
  }, [state]);
  return null;
}
