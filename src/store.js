import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector';
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;

export const stores = new Set();
let index = 0;

function createListener() {
  const listeners = new Set();
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const run = (state) => {
    listeners.forEach((listener) => {
      listener(state);
    });
  };
  return {
    subscribe,
    run,
  };
}

function createStoreImpl(createState) {
  const listener = createListener();
  const store = {
    key: index++,
    state: null,
    getState: () => store.state,
    setState: (state) => {
      store.state = state;
      listener.run(state);
    },
    createState,
    subscribe: listener.subscribe,
  };
  return store;
}

export const createStore = (createState, isEqual) => {
  const store = createStoreImpl(createState);
  stores.add(store);
  return (selector = (state) => state) =>
    useSyncExternalStoreWithSelector(
      store.subscribe,
      store.getState,
      store.getServerState || store.getState,
      selector,
      isEqual
    );
};
