import { useUserStore } from './store';
import { Prvoider } from 'react-global-hook-store';

function Input() {
  const setUser = useUserStore((state) => state.setUser);
  const onInput = (e) => setUser(e.target.value);
  return <input onInput={onInput} />;
}

function Result1() {
  console.log('...Result1');
  const user = useUserStore((state) => state.user);
  return <h1>Result1:{user}</h1>;
}

function Result2() {
  console.log('...Result2');
  const user = useUserStore((state) => state.user);
  return <h1>Result2:{user}</h1>;
}
function Result3() {
  console.log('...Result3');
  const fn = useUserStore((state) => state.fn);
  return <h1>Result3:{fn.name}</h1>;
}

function Result4() {
  console.log('...Result4');
  const store = useUserStore();
  return <h1>Result4:{store.user}</h1>;
}

export default function () {
  console.log('...');
  return (
    <Prvoider>
      <Input />
      <Result1 />
      <Result2 />
      <Result3 />
      <Result4 />
    </Prvoider>
  );
}
