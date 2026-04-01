# useRef in React — Interview Preparation

---

## Theory

### What is useRef?

`useRef` is a React Hook that returns a mutable object `{ current: value }`.  
It persists across renders and updating `.current` does **not** cause a re-render.

```js
const myRef = useRef(initialValue);
// returns → { current: initialValue }
```

---

### How does useRef work internally?

React stores the ref object in the component's Fiber node.  
Unlike state, ref is just a plain JavaScript object — React does not watch it.  
So when you write `ref.current = newValue`, React has no idea it changed,  
which is exactly why no re-render happens.

Think of it like a box React gives you — you can put anything in it,  
change it anytime, and React will never look inside.

---

### useRef vs a regular variable

You might wonder — why not just use a regular `let` variable instead of `useRef`?

```jsx
function Bad() {
  let count = 0; // resets to 0 on every render
  return <button onClick={() => count += 1}>Click</button>;
}
```

A regular variable is **recreated on every render** — so its value is lost.  
`useRef` persists the value across renders because React keeps the ref object alive  
for the full lifetime of the component.

---

### When to use useRef vs useState

> If the **UI needs to show the value** → use `useState`  
> If you just need to **store something silently** → use `useRef`

| | useState | useRef |
|---|---|---|
| Triggers re-render? | Yes | No |
| Value persists across renders? | Yes | Yes |
| Value resets on re-render? | No | No |
| UI reflects the value? | Yes | No |
| Use for | Visible UI data | DOM, timers, previous values |

---

### The Render Cycle and useRef

Every time state or props change, React goes through this cycle:

```
1. Render  →  2. Commit (DOM update)  →  3. useEffect runs
```

`useRef` lives outside this cycle — React never checks `.current` during any phase.  
This is why reading `ref.current` during render is safe but can give you stale values,  
and why writing to `ref.current` in an event handler is perfectly fine.

---

---

## Use Cases

### 1. Track Previous State Value

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCountRef.current}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}
```

---

### 2. DOM Access — Focus an Input

```jsx
function FocusInput() {
  const inputRef = useRef(null);

  return (
    <div>
      <input ref={inputRef} placeholder="Click button to focus" />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </div>
  );
}
```

---

### 3. Store setInterval ID (Stopwatch)

```jsx
function Stopwatch() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <div>
      <p>Time: {time}s</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}
```

---

## Interview Questions & Answers

---

**Q1. What does useRef return and what is special about it?**

It returns a plain object `{ current: value }`.  
What makes it special is that updating `.current` does **not** trigger a re-render,  
but the value still persists across renders — unlike a regular variable.

```js
const ref = useRef(0);
ref.current = 5; // no re-render, value saved
```

---

**Q2. What is the difference between useRef and useState?**

| | useRef | useState |
|---|---|---|
| Triggers re-render? | No | Yes |
| Value persists? | Yes | Yes |
| Update style | `ref.current = x` | `setState(x)` |

Use `useState` when the UI needs to reflect the change.  
Use `useRef` when you just need to store a value silently.

```jsx
const countRef = useRef(0);
countRef.current += 1; // silent, UI stays same

const [count, setCount] = useState(0);
setCount(count + 1); // UI updates
```

---

**Q3. Why do we use useRef to store a setInterval ID instead of useState?**

Because we don't need the component to re-render when the interval ID changes.  
If we used `useState`, calling `setIntervalId()` would cause a useless re-render.

```jsx
const intervalRef = useRef(null);

intervalRef.current = setInterval(() => { ... }, 1000); // no re-render
clearInterval(intervalRef.current); // clean stop
```

---

**Q4. When is ref.current available — before or after mount?**

After mount. During the first render, `ref.current` is `null` for DOM refs.  
React sets it to the actual DOM node only after the component mounts.  
So always access it inside `useEffect`.

```jsx
const inputRef = useRef(null);

useEffect(() => {
  console.log(inputRef.current); // available here
}, []);

return <input ref={inputRef} />;
```

---

**Q5. Why is the previous value different from the current value in useRef?**

Because `useEffect` runs **after** the render is painted to the screen.  
So when JSX is being displayed, `useEffect` has not run yet —  
meaning `ref.current` still holds the value from the **previous render**.

```
1. State changes
2. JSX renders → ref.current is still old value ✅
3. DOM updates
4. useEffect runs → ref.current = new value
```

---

**Q6. Can you store the previous value using useState instead of useRef?**

Technically yes, but it causes problems.  
Calling `setState` inside `useEffect` triggers another re-render,  
which can cause a double render or even a loop.  
`useRef` stores it silently — no extra re-render.

```jsx
// Bad approach — causes extra re-render
const [prevCount, setPrevCount] = useState(0);
useEffect(() => {
  setPrevCount(count); // triggers re-render
}, [count]);

// Good approach — silent, no re-render
const prevCountRef = useRef(0);
useEffect(() => {
  prevCountRef.current = count; // no re-render
}, [count]);
```

---

**Q7. Does mutating ref.current inside useEffect cause a re-render?**

No. Mutating `.current` never causes a re-render no matter where it is done —  
inside `useEffect`, inside event handlers, or anywhere else.

```jsx
useEffect(() => {
  myRef.current = "updated"; // completely silent
});
```

---

**Q8. Can you use useRef inside a loop or if statement?**

No. useRef is a Hook and must follow the **Rules of Hooks** —  
always call at the top level, never inside loops, conditions, or nested functions.

```jsx
// Wrong
if (isLoggedIn) {
  const ref = useRef(null); // breaks rules of hooks
}

// Correct
const ref = useRef(null); // always at top level
```

---

**Q9. What is forwardRef and when do you need it?**

By default you cannot pass `ref` as a prop to a custom component.  
`forwardRef` lets the parent pass a ref into a child component so it can  
attach it to a DOM element inside that child.

```jsx
const MyInput = forwardRef((props, ref) => {
  return <input ref={ref} />;
});

function Parent() {
  const inputRef = useRef(null);
  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}
```

---

**Q10. Real scenario: How do you auto-focus an input when a modal opens?**

```jsx
function Modal({ isOpen }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  return isOpen ? <input ref={inputRef} placeholder="Type here..." /> : null;
}
```

When `isOpen` becomes `true`, the `useEffect` fires after the modal renders  
and focuses the input automatically.

---

**Q11. Why can't we use useRef instead of useState?**

Because `useRef` does not trigger a re-render when `.current` changes.  
So even if the value updates, the UI will never reflect it — the screen stays the same.

```jsx
function Counter() {
  const countRef = useRef(0);

  return (
    <div>
      <p>Count: {countRef.current}</p>
      <button onClick={() => countRef.current += 1}>Increment</button>
    </div>
  );
}
```

You click the button — `countRef.current` becomes `1, 2, 3...`  
but the screen **always shows 0** because React never re-rendered.

`useState` solves this because calling `setCount()` tells React  
"something changed — please re-render and update the UI."

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

Simple rule:
- `useRef` → store silently, UI does not need to change
- `useState` → store + update UI

---