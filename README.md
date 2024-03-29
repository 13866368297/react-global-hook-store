# react-global-hook-store

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
