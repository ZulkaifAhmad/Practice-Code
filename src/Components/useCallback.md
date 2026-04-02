# `useCallback` — Complete Guide

> React Hook | Memoization | Performance Optimization

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Why Function References Matter](#2-why-function-references-matter)
3. [Syntax & Parameters](#3-syntax--parameters)
4. [How It Works Internally](#4-how-it-works-internally)
5. [Basic Usage](#5-basic-usage)
6. [Real-World Scenarios](#6-real-world-scenarios)
7. [useCallback vs useMemo vs React.memo](#7-usecallback-vs-usememo-vs-reactmemo)
8. [Dependency Array Rules](#8-dependency-array-rules)
9. [Common Gotchas](#9-common-gotchas)
10. [When to Use — When to Skip](#10-when-to-use--when-to-skip)
11. [Interview Questions & Answers](#11-interview-questions--answers)
12. [Quick Reference Cheat Sheet](#12-quick-reference-cheat-sheet)

---

## 1. Introduction

`useCallback` is a built-in React hook that **returns a memoized version of a callback function**. It caches the function reference between renders and only creates a new function when its specified dependencies change.

**Definition:**

```js
const memoizedFn = useCallback(fn, dependencies);
```

In JavaScript, functions are objects. Every time a component re-renders, every function defined inside it is **recreated as a brand-new object** — even if the function body is identical. This means two renders produce two different function references, even if the logic is the same.

`useCallback` solves this by keeping the same function reference across renders until something in the dependency array changes.

---

## 2. Why Function References Matter

### The Problem

```js
function Parent() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');

  // New function reference on EVERY render
  const handleClick = () => {
    setCount(count + 1);
  };

  return <Child onClick={handleClick} />;
}

const Child = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
```

Even though `Child` is wrapped in `React.memo`, it will still re-render every time `theme` changes — because `handleClick` is a new reference on every render. `React.memo` does a shallow comparison of props. Since the function reference changed, it sees it as a new prop and re-renders the child.

### The Fix with useCallback

```js
const handleClick = useCallback(() => {
  setCount(prev => prev + 1);
}, []); // stable reference — never recreated
```

Now `handleClick` keeps the same reference. When `theme` changes and the parent re-renders, `Child` receives the same `onClick` prop → `React.memo` skips the re-render.

---

## 3. Syntax & Parameters

```js
const memoizedFn = useCallback(fn, dependencies);
```

| Parameter      | Type       | Description |
|----------------|------------|-------------|
| `fn`           | `function` | The function you want to memoize. React stores this on the first render and returns it on subsequent renders unless deps change. |
| `dependencies` | `array`    | List of reactive values used inside `fn`. React uses `Object.is()` for comparison. If any dep changes, the new function is returned. |
| **Return**     | `function` | The same cached function reference, or the new one if deps changed. |

### Dependency Array Variants

```js
// [] — Created once on mount, never recreated
const reset = useCallback(() => setValue(0), []);

// [dep1, dep2] — Recreated when dep1 or dep2 changes
const fetchUser = useCallback(() => {
  api.get(`/users/${userId}`);
}, [userId]);

// No array — Pointless. New function every render.
const bad = useCallback(() => {}); // ❌ avoid
```

---

## 4. How It Works Internally

React stores hook state in a **fiber node** linked list. For `useCallback`, React:

1. On first render — stores the function and deps array in the fiber.
2. On subsequent renders — compares the new deps array with the stored one using `Object.is()`.
3. If deps are the same — returns the **previously stored function reference**.
4. If any dep changed — stores the new function and returns it.

### useCallback is Just useMemo for Functions

Internally, these two are completely equivalent:

```js
// These produce identical results:
const memoFn = useCallback(() => doSomething(x), [x]);
const memoFn = useMemo(() => () => doSomething(x), [x]);
```

`useCallback(fn, deps)` is syntactic sugar for `useMemo(() => fn, deps)`.

---

## 5. Basic Usage

### Without useCallback (Problem)

```js
function Counter() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // New function on every render
  const increment = () => setCount(count + 1);

  return (
    <div>
      <ExpensiveButton onClick={increment} />
      <button onClick={() => setOther(o => o + 1)}>Other</button>
    </div>
  );
}
```

Every time the "Other" button is clicked, `increment` gets a new reference → `ExpensiveButton` re-renders unnecessarily.

### With useCallback (Fixed)

```js
function Counter() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // Stable reference — only changes if count changes
  const increment = useCallback(() => {
    setCount(c => c + 1); // functional updater → no deps needed
  }, []);

  return (
    <div>
      <ExpensiveButton onClick={increment} />
      <button onClick={() => setOther(o => o + 1)}>Other</button>
    </div>
  );
}

const ExpensiveButton = React.memo(({ onClick }) => {
  console.log('ExpensiveButton rendered');
  return <button onClick={onClick}>Increment</button>;
});
```

Now "Other" button clicks do not re-render `ExpensiveButton`.

---

## 6. Real-World Scenarios

### Scenario 1 — Passing Handler to React.memo Child

The most common use case. Parent has unrelated state changes but passes a handler to a memoized child.

```js
const ProductCard = React.memo(({ product, onDelete, onAddToCart }) => {
  console.log('ProductCard rendered:', product.id);
  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={() => onDelete(product.id)}>Delete</button>
      <button onClick={() => onAddToCart(product.id)}>Add to Cart</button>
    </div>
  );
});

function Shop() {
  const [products, setProducts] = useState([...]);
  const [cartCount, setCartCount] = useState(0);

  // Stable — no deps, uses functional updater
  const handleDelete = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // Stable — no deps, uses functional updater
  const handleAddToCart = useCallback((id) => {
    setCartCount(prev => prev + 1);
    // ... other cart logic
  }, []);

  return (
    <div>
      <p>Cart: {cartCount}</p>
      {products.map(p => (
        <ProductCard
          key={p.id}
          product={p}
          onDelete={handleDelete}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
```

Without `useCallback`, every cart count update would re-render all `ProductCard` components.

---

### Scenario 2 — Function as useEffect Dependency

Without `useCallback`, a function in a `useEffect` dep array causes an **infinite loop**.

```js
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // ❌ BAD — Infinite loop!
  // fetchUser is new on every render
  // → useEffect re-runs → state updates → re-render → new fetchUser → loop
  const fetchUser = () => {
    return fetch(`/api/users/${userId}`).then(r => r.json());
  };

  useEffect(() => {
    fetchUser().then(setUser);
  }, [fetchUser]); // fetchUser changes every render
}
```

```js
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // ✅ GOOD — fetchUser only changes when userId changes
  const fetchUser = useCallback(() => {
    return fetch(`/api/users/${userId}`).then(r => r.json());
  }, [userId]);

  useEffect(() => {
    fetchUser().then(setUser);
  }, [fetchUser]); // safe — stable reference
}
```

---

### Scenario 3 — Debounced Search Input

```js
import { useCallback, useRef } from 'react';

const SearchBar = React.memo(({ onSearch }) => {
  const timerRef = useRef(null);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  }, [onSearch]); // only recreate if onSearch changes

  return <input type="text" onChange={handleChange} placeholder="Search..." />;
});

function App() {
  const [results, setResults] = useState([]);

  const search = useCallback(async (query) => {
    const data = await api.search(query);
    setResults(data);
  }, []); // stable

  return (
    <div>
      <SearchBar onSearch={search} />
      {results.map(r => <p key={r.id}>{r.title}</p>)}
    </div>
  );
}
```

Without `useCallback` on `handleChange`, every keystroke would create a new function and reset the debounce timer — making debouncing ineffective.

---

### Scenario 4 — Custom Hook Returning Stable Functions

When building custom hooks, always wrap returned functions in `useCallback` so consumers get stable references.

```js
function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Stable — functional updater, no deps needed
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // Recreate only when initialValues changes
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  // Stable validator
  const validate = useCallback(() => {
    const newErrors = {};
    if (!values.name) newErrors.name = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  return { values, errors, handleChange, reset, validate };
}
```

If `handleChange` were not wrapped in `useCallback`, any component that uses `useForm` and passes `handleChange` to a memoized input field would re-render that field on every render.

---

### Scenario 5 — Event Handlers in Large Lists

```js
function TodoList({ todos }) {
  const [completed, setCompleted] = useState({});

  // One stable handler for all items — uses item id from argument
  const handleToggle = useCallback((id) => {
    setCompleted(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isCompleted={completed[todo.id]}
          onToggle={handleToggle}
        />
      ))}
    </ul>
  );
}

const TodoItem = React.memo(({ todo, isCompleted, onToggle }) => {
  return (
    <li
      style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}
      onClick={() => onToggle(todo.id)}
    >
      {todo.title}
    </li>
  );
});
```

---

## 7. useCallback vs useMemo vs React.memo

| | `useCallback` | `useMemo` | `React.memo` |
|---|---|---|---|
| **What it memoizes** | A function | A computed value | A component |
| **Returns** | Stable function reference | Stable result value | Memoized component |
| **Applied to** | Functions inside components | Expensive calculations | Component definitions |
| **Works with** | React.memo, useEffect | Any expensive logic | useCallback, useMemo |
| **Re-runs when** | Deps change | Deps change | Props change (shallow) |

### Side-by-side Comparison

```js
// useCallback — memoizes the FUNCTION ITSELF
const handleSubmit = useCallback(() => {
  processData(formData);
}, [formData]);
// handleSubmit is a stable function reference

// useMemo — memoizes the RETURN VALUE of a function
const processedData = useMemo(() => {
  return expensiveTransform(rawData);
}, [rawData]);
// processedData is a stable computed value

// React.memo — memoizes a COMPONENT
const Button = React.memo(({ onClick, label }) => {
  return <button onClick={onClick}>{label}</button>;
});
// Button skips re-render if onClick and label are same references
```

### The Golden Rule

> `useCallback` is only beneficial when the child component is wrapped in `React.memo` — OR when the function is used as a dependency in `useEffect` or `useMemo`.
>
> Without `React.memo` on the child, a stable function reference has zero impact on rendering performance.

---

## 8. Dependency Array Rules

React uses `Object.is()` for shallow comparison of each dependency.

### Primitives — Safe as Deps

```js
const fn = useCallback(() => {
  console.log(userId, role);
}, [userId, role]); // strings/numbers → stable comparison ✓
```

### Objects/Arrays — Dangerous as Deps

```js
// ❌ config = {} is a new object every render
const fn = useCallback(() => {
  api.post('/data', config);
}, [config]); // config changes every render → fn is always new

// ✅ Extract primitive values from the object
const fn = useCallback(() => {
  api.post('/data', { id: config.id, type: config.type });
}, [config.id, config.type]); // stable primitives ✓
```

### Functions as Deps — Use useCallback on Them Too

```js
// ❌ onSuccess is a new function each render
const fetchData = useCallback(() => {
  api.get('/data').then(onSuccess);
}, [onSuccess]); // onSuccess changes → fetchData changes

// ✅ Memoize onSuccess first
const onSuccess = useCallback((data) => {
  setResults(data);
}, []);

const fetchData = useCallback(() => {
  api.get('/data').then(onSuccess);
}, [onSuccess]); // now stable ✓
```

---

## 9. Common Gotchas

### Gotcha 1 — Stale Closure

The most dangerous pitfall. If a variable used inside the callback is not in the deps array, the function captures its old value forever.

```js
function Timer() {
  const [count, setCount] = useState(0);

  // ❌ Stale closure — count is always 0 inside
  const logCount = useCallback(() => {
    console.log(count); // always logs 0
  }, []); // count missing from deps

  // ✅ Option A — include count in deps
  const logCount = useCallback(() => {
    console.log(count);
  }, [count]);

  // ✅ Option B — use a ref to always get latest value
  const countRef = useRef(count);
  useEffect(() => { countRef.current = count; });
  const logCount = useCallback(() => {
    console.log(countRef.current); // always latest
  }, []);
}
```

---

### Gotcha 2 — Memoizing Without React.memo (Useless)

```js
// ❌ Child is not memoized — useCallback does nothing useful here
function Parent() {
  const handleClick = useCallback(() => {}, []);
  return <NormalChild onClick={handleClick} />; // still re-renders
}

// ✅ Pair useCallback with React.memo
const MemoChild = React.memo(({ onClick }) => <button onClick={onClick}>Click</button>);

function Parent() {
  const handleClick = useCallback(() => {}, []);
  return <MemoChild onClick={handleClick} />; // now skips re-render ✓
}
```

---

### Gotcha 3 — Over-optimization

```js
// ❌ Wrapping every function "just in case"
function SimpleForm() {
  const handleA = useCallback(() => setA(v => !v), []);
  const handleB = useCallback(() => setB(v => !v), []);
  const handleC = useCallback(() => setC(v => !v), []);
  // If children are not React.memo, this is wasted memory
}
```

Every `useCallback` adds memory overhead. React stores the previous function. Profile with React DevTools Profiler first — optimize only proven bottlenecks.

---

### Gotcha 4 — Infinite Loops When Forgetting useCallback in useEffect

```js
// ❌ fetchData is new every render → useEffect runs every render → infinite loop
function App() {
  const fetchData = () => fetch('/api/data');

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is always new
}

// ✅ Wrap in useCallback — effect only runs once
function App() {
  const fetchData = useCallback(() => fetch('/api/data'), []);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is stable
}
```

---

### Gotcha 5 — Strict Mode Double Invocation

In development with `React.StrictMode`, React intentionally renders components twice. This means without `useCallback`, you'll see double the function instances. This makes bugs like stale closures and unnecessary re-renders more visible — which is the purpose. In production, double-invocation does not occur.

---

## 10. When to Use — When to Skip

### Use useCallback when:

- Passing a function as a prop to a `React.memo` wrapped child
- A function is listed as a dependency in `useEffect`, `useMemo`, or another `useCallback`
- Building a custom hook that returns functions (to keep consumer code predictable)
- Working with context where the value includes functions passed to many children

### Skip useCallback when:

- The function is only used inside the same component (no prop passing)
- The child component is not wrapped in `React.memo`
- The component is simple and lightweight — memoization cost outweighs benefit
- You haven't profiled and confirmed the component is a performance bottleneck

---

## 11. Interview Questions & Answers

---

### Q1. What is `useCallback` and why do we need it?

**Answer:**

`useCallback` is a React hook that returns a memoized function reference. In React, every render recreates all functions defined inside the component — even if their logic hasn't changed. When these functions are passed as props to `React.memo` children, the children re-render unnecessarily because they receive what looks like a new prop (new reference). `useCallback` solves this by caching the function and returning the same reference until its dependencies change.

---

### Q2. What is the difference between `useCallback` and `useMemo`?

**Answer:**

Both are memoization hooks but they memoize different things:

- `useCallback` memoizes a **function itself** and returns a stable function reference.
- `useMemo` memoizes a **computed value** and returns the result of calling a function.

Internally, `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

Use `useCallback` when you need a stable function reference to pass as a prop or use in a dependency array. Use `useMemo` when you need to cache the result of an expensive computation.

---

### Q3. Does `useCallback` always improve performance?

**Answer:**

No. `useCallback` has its own cost — React must store the previous function and compare dependencies on every render. If the child component is not wrapped in `React.memo`, stabilizing the function reference has zero benefit because the child re-renders regardless of props.

`useCallback` only helps when:
1. The child uses `React.memo` and does a shallow prop comparison
2. The function is in a `useEffect` / `useMemo` dependency array

Over-using `useCallback` is an anti-pattern. Profile first, optimize only bottlenecks.

---

### Q4. Explain the stale closure problem in `useCallback`.

**Answer:**

A stale closure happens when a function closes over an old value of a variable. If you use a state or prop variable inside `useCallback` but omit it from the dependency array, the callback captures the value from the render it was created in and never updates — leading to bugs where the function operates on outdated data.

```js
// Bug: count is always 0 inside the function
const fn = useCallback(() => console.log(count), []);

// Fix A: include count in deps
const fn = useCallback(() => console.log(count), [count]);

// Fix B: use functional updater (no stale closure possible)
const fn = useCallback(() => setCount(prev => prev + 1), []);
```

---

### Q5. Why does `useCallback` need `React.memo` to be useful?

**Answer:**

`useCallback` stabilizes a function's reference. But React only skips re-rendering a child if the child performs a prop comparison — which only happens when wrapped in `React.memo`. A regular component always re-renders when its parent re-renders, regardless of prop changes. The two must work together:

- `React.memo` — compares props shallowly
- `useCallback` — ensures the function prop passes that comparison by keeping the same reference

Without `React.memo`, `useCallback` is pointless for preventing re-renders.

---

### Q6. When would you use an empty dependency array `[]`?

**Answer:**

An empty array means the function is created once on mount and never recreated. This is safe when the function doesn't read any component state, props, or any changing value from the component scope.

The safest pattern is using the functional updater form of setState:

```js
// Safe with [] — doesn't read count from closure
const increment = useCallback(() => setCount(prev => prev + 1), []);

// Unsafe with [] — reads count from closure (stale)
const increment = useCallback(() => setCount(count + 1), []); // ❌
```

---

### Q7. How does `useCallback` help when used with `useEffect`?

**Answer:**

If a function defined in a component is included in a `useEffect` dependency array without `useCallback`, it will run the effect on every render — because the function is a new reference each render. This can cause infinite loops.

Wrapping the function in `useCallback` stabilizes its reference. Now `useEffect` only re-runs when the function's own dependencies change — not on every render.

```js
// ❌ Infinite loop
const fetchData = () => fetch('/api/data');
useEffect(() => { fetchData(); }, [fetchData]);

// ✅ Effect runs only when userId changes
const fetchData = useCallback(() => fetch(`/api/users/${userId}`), [userId]);
useEffect(() => { fetchData(); }, [fetchData]);
```

---

### Q8. Can `useCallback` cause memory leaks?

**Answer:**

Not memory leaks in the traditional sense, but excessive `useCallback` usage increases memory consumption because React holds references to previous function versions. If a memoized callback closes over large objects or DOM nodes, it can delay garbage collection.

Best practices:
- Don't memoize every function — be selective
- Keep closures minimal; use functional updaters where possible
- Avoid capturing large objects in the callback closure

---

### Q9. Real example — delete handler in a list of items

**Answer:**

```js
const ProductItem = React.memo(({ product, onDelete }) => {
  console.log('Rendered:', product.id);
  return (
    <div>
      <span>{product.name}</span>
      <button onClick={() => onDelete(product.id)}>Delete</button>
    </div>
  );
});

function ProductList() {
  const [products, setProducts] = useState([...]);
  const [searchQuery, setSearchQuery] = useState('');

  // Stable handler — won't cause children to re-render when searchQuery changes
  const handleDelete = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <div>
      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      {products.map(p => (
        <ProductItem key={p.id} product={p} onDelete={handleDelete} />
      ))}
    </div>
  );
}
```

Without `useCallback`, typing in the search box would re-render every `ProductItem` because `handleDelete` gets a new reference.

---

### Q10. How does `useCallback` behave in React Strict Mode?

**Answer:**

In `React.StrictMode` (development only), React intentionally double-invokes component functions to detect side effects. Components render twice, which means functions defined without `useCallback` have two different instances created per render cycle. This makes bugs like stale closures and unnecessary child re-renders more visible during development — which is the purpose of Strict Mode. `useCallback` itself is not double-invoked. In production, double-invocation does not happen.

---

## 12. Quick Reference Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│                     useCallback Cheat Sheet                     │
├─────────────────────────────────────────────────────────────────┤
│  Syntax        useCallback(fn, [deps])                          │
│  Returns       Memoized function reference                      │
│  Re-creates    When deps change (Object.is comparison)          │
├─────────────────────────────────────────────────────────────────┤
│  USE when                                                       │
│    → Passing handler to React.memo child                        │
│    → Function is in useEffect / useMemo dep array               │
│    → Returning function from a custom hook                      │
├─────────────────────────────────────────────────────────────────┤
│  SKIP when                                                      │
│    → Child is not wrapped in React.memo                         │
│    → Function is only used in the same component                │
│    → No performance issue confirmed by profiling                │
├─────────────────────────────────────────────────────────────────┤
│  Golden Rule                                                    │
│    useCallback + React.memo must work together.                 │
│    One without the other is mostly useless.                     │
├─────────────────────────────────────────────────────────────────┤
│  Avoid stale closures                                           │
│    Use setCount(prev => prev + 1) instead of setCount(count+1)  │
│    Then you can safely use [] as deps                           │
├─────────────────────────────────────────────────────────────────┤
│  Equivalent to                                                  │
│    useCallback(fn, deps) === useMemo(() => fn, deps)            │
└─────────────────────────────────────────────────────────────────┘
```

### Common Patterns at a Glance

```js
// Pattern 1 — Stable handler (no deps)
const handleReset = useCallback(() => setValue(''), []);

// Pattern 2 — Handler with dep
const fetchUser = useCallback(() => api.get(`/users/${id}`), [id]);

// Pattern 3 — Functional updater (safest, empty deps)
const increment = useCallback(() => setCount(c => c + 1), []);

// Pattern 4 — Custom hook returning stable fn
function useToggle(initial) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(v => !v), []);
  return [on, toggle];
}

// Pattern 5 — Avoid object dep (extract primitives)
const fn = useCallback(() => doWork(user.id, user.role), [user.id, user.role]);
```

---

*Guide covers React 18+ behavior. All examples use functional components and hooks.*