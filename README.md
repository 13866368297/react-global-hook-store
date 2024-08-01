### react-global-hook-store

全局 hooks 状态管理库

特点：

- 极少的代码体积（80 行代码），减轻项目打包依赖的体积
- 极小的样板代码，使用 hooks 做状态管理，友好的开发体验
- 支持细颗粒度 selector state 更新，提高 React 应用使用的性能

示例：

```javascript
//第一步
<Provider>
  <App />
</Provider>;

//第二步
function useUser() {
  const [user, setUser] = useState('');
  return {
    user,
    setUser,
  };
}

export const useUserStore = createStore(useUser);

//第三步
const user = useUserStore((state) => state.user);
```

### 实现思路

首先，我们思考一个问题，如果想要用 hook 去管理状态，就需要在 React 的组件中管理 hook 状态，受限于 Context 本身的一些局限性，所以我们需要实现自定义的 HookStore 组件去管理全局的状态，再建立和使用全局状态的组件的关联，当 hook 状态变化时通知使用的组件更新。而建立 HookStore 组件和使用 hook 的组件的关联，可以通过创建 中间层 store 去串联他们的关系。

![store-summary.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ba354fe20c54a1bb1556776633e5779~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=529&h=302&s=36583&e=png&b=ffffff)

#### store 初始化

首先我们需要创建 store，然后在 React 中自定义 HookStore 组件在 render 的过程中给 store 提供 state，这样子组件在 render 的时候就能获取到 store 中 state。

![store-render.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a55d4dd467c41318b564185c63e93d5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=605&h=312&s=64906&e=png&b=fefefe)

##### createStore

store 用来管理 state，这里 state 是 hook state 并不能直接在 store 中定义，需要在 React 组件 render 时提供。所以先在 store 中定义 createState 函数，在 自定义 HookStore 组件 render 的时候执行 createState 生成 hook state。

```javascript
let index = 0;
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
```

lisenter 是用来订阅 store 中的 state 变化的事件，在我们的状态库中可以订阅使用 store 组件的更新。

```javascript
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
```

##### store 连接 HookStore 组件

怎么使 store 可以接入 React 组件中呢。

首先我们需要在 React 组件渲染前，准备好所有的 store。

```javascript
    export const stores = new Set();

    export const createStore = (createState) => {
      const store = createStoreImpl(createState);
      // 存储所有stores
      stores.add(store);
      ...
    };

    // 使用方式
    function useUser() {
      const [user, setUser] = useState('');
      return {
        user,
        setUser,
      };
    }
    createStore(useUser);
```

在 React 组件渲染前 createStore 创建 store，将所有的 store 存储到 stores 中。然后我们可以 在 React 中定义 HookStore 组件，在 HookStore 组件中拿到 store，在 HookStore 组件 render 时执行 createState 生成 hook state，将 hook state 添加到 store 中。因为我们有多个 store，并且每个 store 之间是隔离的，所以每个 store 都需要对应一个 HookStore 组件。

Prvoider 组件根据 stores 渲染多个 HookStore 组件

```javascript
export default function Prvoider({ children }) {
  return (
    <>
      {Array.from(stores).map((store) => (
        <HookStore store={store} key={store.key} />
      ))}
      {children}
    </>
  );
}
```

HookStore 组件中 store.createState() 生成 hook state，并通过 store.setState(state) 给 store 设置 state

```javascript
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
```

HookStore 组件 render 完 store 中已经存在 hook state 了。

##### 组件中使用 store

在组件中怎么使用 store 呢。在 createStore 的时候，我们返回一个 useStore 方法，通过 useStore 我们可以很方便使用 store 中的状态。并且提供 selector 方式筛选 state，并且可以更细颗粒度的通过 selector 的 state 更新组件。

```javascript
export const createStore = (createState) => {
  const store = createStoreImpl(createState);
  stores.add(store);
  return (selector = (state) => state) => selector(store.state);
};
```

#### store 更新

在组件中触发 store 的 setState，因为 setState 是在 HookStore 组件中提供的，所以只会触发 HookStore 组件的更新，但是 hook 组件的更新又如何触发使用了 store 的组件更新呢，所以我们可以在组件在使用 store 时，让 store 订阅组件更新，这样在 store 的 state 发生变化时就可以通知使用了 store 组件的更新。

![store-update.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6cf708ac047a457ba2c8ea86acb8f1a0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=605&h=312&s=59105&e=png&b=fefefe)

##### 通知组件更新

在组件中使用 createStore 返回的 useStore 方法，在 useStore 方法中我们可以使用 React 官方提供的`useSyncExternalStoreWithSelector`  的方法，让 store 订阅 组件的更新。

```javascript
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
```

并且在`useSyncExternalStoreWithSelector`中，我们使用 selector 可以筛选 state，更细颗粒度的更新组件。

### useSyncExternalStoreWithSelector

在  `useSyncExternalStoreWithSelector`  中 通过  `useSyncExternalStore`  实现对组件更新的订阅。在`useSyncExternalStoreWithSelector`中对  `getSnapshot`  的方法进行了扩展，让它具有`selector state`  的能力，并且可以使用`isEqual`自定义组件更新逻辑。

简化的`useSyncExternalStoreWithSelector`源码如下

```javascript
export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (() => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: void | null | (() => Snapshot),
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean
): Selection {
  const [getSelection] = useMemo(() => {
    const memoizedSelector = (nextSnapshot: Snapshot) => {
      const prevSnapshot: Snapshot = (memoizedSnapshot: any);
      const prevSelection: Selection = (memoizedSelection: any);
      if (is(prevSnapshot, nextSnapshot)) {
        return prevSelection;
      }
      const nextSelection = selector(nextSnapshot);
      if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
        return prevSelection;
      }
      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;
      return nextSelection;
    };
    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot());
    return [getSnapshotWithSelector];
  }, [getSnapshot, selector, isEqual]);

  const value = useSyncExternalStore(
    subscribe,
    getSelection,
    getServerSelection
  );
  return value;
}
```

封装 getSelection 方式作为  `useSyncExternalStore`  的 getSnapshot。 在 getSelection 中通过 selector 过滤 state 中的值，并且通过`isEqual`比较新旧的 state 来决定是否返回新的 state，从而来决定在`useSyncExternalStore`接入时是否更新。

### useSyncExternalStore

在  `useSyncExternalStore`  中通过提供的 subscribe 订阅组件的更新，而组件的更新判断是通过  `getSnapshot`  获取的 state 的新旧的值是否一致来决定的。

```javascript

// 简化 mountSyncExternalStore
function mountSyncExternalStore<T>(
  subscribe: (() => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T,
): T {
  // 获取最新的状态
  const  nextSnapshot = getSnapshot();
  ......
  // 订阅更新
  subscribeToStore.bind(null, fiber, inst, subscribe), [subscribe]
  ......
  return nextSnapshot;
}

// 订阅更新
function subscribeToStore<T>(
  fiber: Fiber,
  inst: StoreInstance<T>,
  subscribe: (() => void) => () => void,
): any {
  const handleStoreChange = () => {
    // The store changed. Check if the snapshot changed since the last time we
    // read from the store.
    if (checkIfSnapshotChanged(inst)) {
      // Force a re-render.
      forceStoreRerender(fiber);
    }
  };
  // Subscribe to the store and return a clean-up function.
  return subscribe(handleStoreChange);
}

//比较前后的状态
function checkIfSnapshotChanged<T>(inst: StoreInstance<T>): boolean {
  const latestGetSnapshot = inst.getSnapshot;
  const prevValue = inst.value;
  try {
    const nextValue = latestGetSnapshot();
    return !is(prevValue, nextValue);
  } catch (error) {
    return true;
  }
}

// react更新
function forceStoreRerender(fiber: Fiber) {
  const root = enqueueConcurrentRenderForLane(fiber, SyncLane);
  if (root !== null) {
    scheduleUpdateOnFiber(root, fiber, SyncLane);
  }
}
```

### 总结

我们定义 HookState 组件管理全局 hook state。

创建 store 建立 HookState 和使用 store 组件的联系，当 hook state 变化时，通知使用 store 的组件的更新。

在 useStore 时通过`useSyncExternalStoreWithSelector`  订阅组件的更新，并通过`selector`和 `isEqual`  实现 state 筛选，和更细颗粒度的组件更新。

[npm 链接(react-global-hook-store)](https://www.npmjs.com/package/react-global-hook-store)

[github 链接(react-global-hook-store)](https://github.com/13866368297/react-global-hook-store)
