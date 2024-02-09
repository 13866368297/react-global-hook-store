import { useState } from 'react';
import { createStore } from 'react-global-hook-store';
const fn = () => {};
function useUser() {
  const [user, setUser] = useState('hjj');
  return {
    user,
    setUser,
    fn,
  };
}

export const useUserStore = createStore(useUser);
