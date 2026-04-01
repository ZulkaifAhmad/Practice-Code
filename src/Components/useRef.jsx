import React from 'react'
import { useState , useRef } from 'react';

function UseRef() {
    const inputRef = useRef(null);
    const [timer , setTimer] = useState(0)
    const intervalId = useRef(null)

    function focusMood(){
        inputRef.current.focus();
    }
    function startTimer(){
        if (intervalId.current !== null) return ;

        intervalId.current = setInterval(()=>{
            setTimer((prev)=> prev + 1)
        },10)
    }
    function stopTimer(){
        clearInterval(intervalId.current)
        intervalId.current = null
    }
    function ResetTimer(){
        stopTimer();
        setTimer(0)
    }

  return (
    <div>
        <h1>UseRef</h1>
        <hr />
        <p>useRef is a hook in React that allows you to create a mutable reference that persists across re-renders. It is commonly used to access and manipulate DOM elements directly, store mutable values, or keep track of previous state values without causing re-renders.</p>
        <p>Here are some common use cases for useRef:</p>
        <hr />
        <h2>1. Accessing DOM Elements</h2>
            <input ref={inputRef} type="text" placeholder='Write something' />
            <button onClick={focusMood}>Focus</button>
        <hr />
        <h2>Timer</h2>
        {timer}
        <br />
        <button onClick={startTimer}>Start</button>
        <button onClick={stopTimer}>Stop</button>
        <button onClick={ResetTimer}>Reset</button>
        <hr />
    </div>
  )
}

export default UseRef