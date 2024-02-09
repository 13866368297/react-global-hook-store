import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector';
import { useRef, useEffect } from 'react';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';

var useSyncExternalStoreWithSelector = useSyncExternalStoreExports.useSyncExternalStoreWithSelector;
var stores = new Set();
var index = 0;
function createListener() {
  var listeners = new Set();
  var subscribe = function subscribe(listener) {
    listeners.add(listener);
    return function () {
      return listeners["delete"](listener);
    };
  };
  var run = function run(state) {
    listeners.forEach(function (listener) {
      listener(state);
    });
  };
  return {
    subscribe: subscribe,
    run: run
  };
}
function createStoreImpl(createState) {
  var listener = createListener();
  var store = {
    key: index++,
    state: null,
    getState: function getState() {
      return store.state;
    },
    setState: function setState(state) {
      store.state = state;
      listener.run(state);
    },
    createState: createState,
    subscribe: listener.subscribe
  };
  return store;
}
var createStore = function createStore(createState, isEqual) {
  var store = createStoreImpl(createState);
  stores.add(store);
  return function () {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (state) {
      return state;
    };
    return useSyncExternalStoreWithSelector(store.subscribe, store.getState, store.getServerState || store.getState, selector, isEqual);
  };
};

function HookStore(_ref) {
  var store = _ref.store;
  var mounted = useRef(false);
  var state = store.createState();
  if (!mounted.current) {
    store.setState(state);
  }
  useEffect(function () {
    if (mounted.current) {
      store.setState(state);
    } else {
      mounted.current = true;
    }
  }, [state]);
  return null;
}

function Prvoider(_ref) {
  var children = _ref.children;
  return /*#__PURE__*/jsxs(Fragment, {
    children: [Array.from(stores).map(function (store) {
      return /*#__PURE__*/jsx(HookStore, {
        store: store
      }, store.key);
    }), children]
  });
}

export { Prvoider, createStore, stores };
