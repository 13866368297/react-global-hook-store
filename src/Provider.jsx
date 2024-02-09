import { stores } from './store';
import HookStore from './HookStore';

export function Prvoider({ children }) {
  return (
    <>
      {Array.from(stores).map((store) => (
        <HookStore store={store} key={store.key} />
      ))}
      {children}
    </>
  );
}
