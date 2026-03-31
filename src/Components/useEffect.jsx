import React , {useEffect} from 'react'
import Counter from './Counter'

function UseEffect() {
    console.log("Component Rendered")
    useEffect(() => {
      alert("Component Rendered")
    
      return () => {
        alert("Component Unmounted")
      }
    }, [])
    
  return (
    <div>UseEffect

        <br />
        <Counter />
    </div>
  )
}

export default UseEffect