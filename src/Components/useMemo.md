# useMemo in React — Interview Preparation

---

## Definition

`useMemo` is a React Hook that **caches the result of a calculation** between renders.
It only recalculates when its dependencies change.

```js
const result = useMemo(() => {
  return someExpensiveCalculation()
}, [dependency])
```

- First argument — a function that returns the value you want to cache
- Second argument — dependency array (same concept as useEffect)
- Returns — the cached value directly

---

## Theory

### 1. Why useMemo exists

Every time a component re-renders, every line of code inside it runs again.
This includes heavy calculations, filters, and sorts — even if the data they depend on has not changed.

```jsx
function App() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("")

  const total = slowCalculation(count) // runs on EVERY render

  return (
    <div>
      <input onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setCount(c => c + 1)}>Count</button>
      <p>Total: {total}</p>
    </div>
  )
}
```

When the user types in the input, the component re-renders and `slowCalculation`
runs again even though `count` did not change. This is wasteful.

With `useMemo`:

```jsx
const total = useMemo(() => {
  return slowCalculation(count)
}, [count])
```

Now typing in the input triggers a re-render but `slowCalculation` is skipped
because `count` did not change. React returns the cached result.

---

### 2. How useMemo works internally

React stores the cached value inside the component's Fiber node.
On every re-render, React compares each dependency using `Object.is()`.

```
First render  →  runs the function  →  stores result in Fiber node
Re-render     →  compares dependencies using Object.is()
                  → changed?  →  runs function again, stores new result
                  → same?     →  returns cached result, skips function
```

---

### 3. useMemo vs a regular variable

```jsx
// Regular variable — recalculated on every render
const total = count * 2

// useMemo — only recalculated when count changes
const total = useMemo(() => count * 2, [count])
```

For simple calculations like `count * 2`, a regular variable is fine.
`useMemo` is only worth it when the calculation is genuinely expensive.

---

### 4. The Object Reference Problem

In JavaScript, two objects with the same values are NOT equal:

```js
{ theme: "dark" } === { theme: "dark" }  // false
```

Every render creates a new object in memory — even if values are identical.
This causes child components to re-render unnecessarily even when nothing visually changed.

`useMemo` solves this by returning the same object reference:

```jsx
const config = useMemo(() => {
  return { theme: "dark", language: "en" }
}, []) // created once, same reference every render
```

---

### 5. useMemo vs useCallback

These two are almost identical — the only difference is what they cache.

| | useMemo | useCallback |
|---|---|---|
| Caches | a value or result | a function |
| Returns | return value of the function | the function itself |
| Use for | calculations, objects, arrays | event handlers, callbacks |

```js
const total = useMemo(() => a + b, [a, b])         // caches the result
const handleClick = useCallback(() => { }, [])      // caches the function
```

`useCallback(fn, deps)` is exactly equal to `useMemo(() => fn, deps)`

---

### 6. When to use and when NOT to use useMemo

`useMemo` itself has a small cost — React stores the value and compares
dependencies on every render. So do not use it everywhere.

Use it when:
- Filtering or sorting large arrays
- Heavy math or data transformation
- Creating objects or arrays passed as props to `React.memo` children

Do NOT use it when:
- The calculation is simple like `count * 2`
- The component rarely re-renders
- You are using it just out of habit

```jsx
// Overkill — regular variable is better here
const double = useMemo(() => count * 2, [count])

// Good use — expensive filter on large data
const filtered = useMemo(() => {
  return bigList.filter(item => item.active)
}, [bigList])
```

---

### 7. Render Cycle and useMemo

```
1. State or props change
2. React renders the component (runs the function body)
3. useMemo checks its dependencies
     → same?    → skips, returns cached value
     → changed? → runs, caches new value
4. DOM updates
5. useEffect runs
```

`useMemo` runs during the render phase — not after like `useEffect`.

---

## Interview Questions & Answers

---

**Q1. What is useMemo and why is it used?**

`useMemo` caches the result of a function and returns it across renders.
It is used to avoid re-running expensive calculations when the data they depend on has not changed.

```jsx
const total = useMemo(() => {
  return numbers.reduce((a, b) => a + b, 0)
}, [numbers])
```

---

**Q2. What problem does useMemo solve?**

In React, every re-render runs all the code inside the component again.
If a component has a heavy calculation and an unrelated state changes,
that calculation runs again unnecessarily.

`useMemo` skips the calculation if dependencies are the same and returns the cached result.

```jsx
const [count, setCount] = useState(0)
const [name, setName] = useState("")

// Without useMemo — runs on every render including when name changes
const result = heavyWork(count)

// With useMemo — only runs when count changes
const result = useMemo(() => heavyWork(count), [count])
```

---

**Q3. What is the dependency array in useMemo?**

The dependency array tells React when to recalculate the memoized value.
React compares each item using `Object.is()` — same as `useEffect`.

```jsx
const result = useMemo(() => a + b, [a, b])
// recalculates only when a or b changes
```

- Empty array `[]` — calculates once on first render, never again
- No array — recalculates on every render (pointless, defeats the purpose)
- With values `[a, b]` — recalculates only when those values change

---

**Q4. What happens if you forget a dependency in useMemo?**

You get a stale value. The function uses the old value of the missing dependency
because React does not know it changed.

```jsx
const result = useMemo(() => {
  return count * multiplier
}, [count]) // multiplier is missing

// If multiplier changes, result still uses the old multiplier value
```

Always include every variable used inside the function in the dependency array.

---

**Q5. What is the difference between useMemo and useCallback?**

Both cache things to avoid unnecessary work. The difference is what they cache.

`useMemo` caches a computed value. `useCallback` caches a function.

```jsx
const total = useMemo(() => a + b, [a, b])
// total = the number result, e.g. 5

const add = useCallback(() => a + b, [a, b])
// add = the function itself, e.g. () => a + b
```

`useCallback(fn, deps)` is exactly the same as `useMemo(() => fn, deps)`

---

**Q6. Does useMemo prevent re-renders?**

No. `useMemo` does not prevent a component from re-rendering.
It only skips re-running the expensive function inside it.

To prevent a child component from re-rendering, use `React.memo`.
`useMemo` is often used together with `React.memo` — you memoize the value
passed as a prop so the child does not see a new reference and re-render.

```jsx
const config = useMemo(() => ({ theme: "dark" }), [])

// Child wrapped in React.memo will not re-render
// because config reference stays the same
return <Child config={config} />
```

---

**Q7. Why is useMemo useful for object and array props?**

In JavaScript, objects and arrays are compared by reference, not by value.

```js
{} === {}      // false
[] === []      // false
```

Every render creates a new object or array in memory — even if values are identical.
When passed as props to a child, the child sees a "new" prop and re-renders.

`useMemo` keeps the same reference across renders unless dependencies change.

```jsx
const filters = useMemo(() => {
  return { status: "active", page: 1 }
}, [])
// same object reference every render — child will not re-render
```

---

**Q8. When should you NOT use useMemo?**

When the calculation is simple and cheap. `useMemo` itself has overhead —
React has to store the value and run the comparison on every render.
For simple operations, this overhead costs more than just recalculating.

```jsx
// Pointless — just write count * 2 directly
const double = useMemo(() => count * 2, [count])

// Worth it — heavy filter on thousands of items
const filtered = useMemo(() => {
  return bigData.filter(item => item.isActive)
}, [bigData])
```

---

**Q9. What is the difference between useMemo and useEffect?**

| | useMemo | useEffect |
|---|---|---|
| When it runs | During render | After render |
| Returns | A cached value | Nothing |
| Purpose | Optimize a calculation | Run a side effect |
| Use for | Derived data | API calls, subscriptions, DOM changes |

```jsx
// useMemo — runs during render, returns a value
const total = useMemo(() => items.reduce((a, b) => a + b, 0), [items])

// useEffect — runs after render, returns nothing
useEffect(() => {
  document.title = `Total: ${total}`
}, [total])
```

---

**Q10. Real scenario — filter a large product list using useMemo**

```jsx
function ProductList({ products }) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search])

  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {filtered.map(p => <li key={p.id}>{p.name}</li>)}
      </ul>
    </div>
  )
}
```

Without `useMemo`, the filter runs on every keystroke AND any other state change.
With `useMemo`, it only runs when `products` or `search` actually changes.

---

**Q11. Why can't we use useMemo instead of useEffect?**

They solve completely different problems.

`useEffect` is for side effects — things that happen outside React's render cycle
like API calls, subscriptions, or manually updating the DOM.

`useMemo` is for derived data — computing a value from existing state or props.

```jsx
// Wrong — fetching data inside useMemo
const data = useMemo(() => {
  fetch("/api/data") // side effect inside useMemo — BAD
}, [])

// Correct — fetch inside useEffect
useEffect(() => {
  fetch("/api/data").then(res => res.json()).then(setData)
}, [])

// Correct — derive data using useMemo
const total = useMemo(() => data.reduce((a, b) => a + b, 0), [data])
```

---