import { useState } from 'react';
import ClassComp from './Components/ClassComp';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <ClassComp />

      <h1>{count}</h1>
      <button onClick={() => {
        setCount(count + 1);
        setCount(count + 1);
      }}>
        Click
      </button>
      
    </div>
  );
}