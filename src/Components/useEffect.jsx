import React, { useEffect } from 'react'

function UseEffect() {
  let [count, setCount] = React.useState(0);
  console.log("Component Rendered");

//   useEffect(()=>{
//     console.log('useEffect called');
//   },
//   [count]
// );

    useEffect(()=>{
      const interval = setTimeout(() => {
        console.log('Interval called');
      },1000);

      return () => {
        console.log("Cleanup function called");
        clearTimeout(interval);
      }
    },[]);

  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Click
      </button>
    </div>
  )
}

export default UseEffect