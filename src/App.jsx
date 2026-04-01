import { useState } from 'react';
import ClassComp from './Components/ClassComp';
import UseEffect from './Components/useEffect';
import Counter from './Components/Counter';

export default function App() {
  const [count, setCount] = useState(0);
  const [user , setUser] = useState({  name: 'John' , age : 23  });
  const changeName = () => {
    setUser({ ...user , name: 'Doe' });
  }

  return (
    <div>
      {user.name}
      {user.age}
      <br />
      <br />
      <button onClick={changeName}>
        Change Name
      </button>
      <hr />
      <UseEffect />
      {/* <ClassComp />

      <h1>{count}</h1>
      <button onClick={() => {
        setCount(count + 1);
        setCount(count + 1);
      }}>
        Click
      </button>
      <br />
      <br />
      <br />
      <Counter /> */}

      
    </div>
  );
}