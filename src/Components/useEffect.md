# useEffect Hook - Complete Guide for Interviews

## 🔹 1. What is useEffect?

`useEffect` is a React Hook used to perform **side effects** in functional components. Side effects are operations that happen **outside React rendering**.

### Examples of Side Effects:

* API calls
* Timers (`setInterval`, `setTimeout`)
* Subscribing to events (scroll, resize)
* Direct DOM manipulation

---

## 🔹 2. Basic Syntax

```js
useEffect(() => {
  // side effect code

  return () => {
    // cleanup code (optional)
  };
}, [dependencies]);
```

### Parts Explained:

1. **Effect Function** - Runs the side effect.
2. **Dependency Array** - Controls when the effect runs.
3. **Cleanup Function** - Runs before next effect or unmount to clean resources.

---

## 🔹 3. Types of useEffect Runs

### 1. Run on Every Render

```js
useEffect(() => {
  console.log("Runs on every render");
});
```

### 2. Run Only Once (On Mount)

```js
useEffect(() => {
  console.log("Runs only once");
}, []);
```

### 3. Run When Dependency Changes

```js
useEffect(() => {
  console.log("Runs when count changes");
}, [count]);
```

---

## 🔹 4. Cleanup Function Example

```js
useEffect(() => {
  const interval = setInterval(() => console.log("Running..."), 1000);
  return () => clearInterval(interval);
}, []);
```

---

## 🔹 5. Rules & Best Practices

* Do not make `useEffect` async directly. Use an inner async function.
* Always handle dependencies correctly to prevent bugs.
* Avoid infinite loops by careful dependency management.
* Keep rendering pure; side effects go inside `useEffect`.

---

## 🔹 6. Real World Analogy

* **Render**: Display UI
* **useEffect**: Do extra work after UI shows

---

## 🔹 7. Common Bugs to Avoid

* Infinite loops from changing state inside `useEffect` without proper dependency.
* Missing dependencies leading to stale data.
* Using objects/functions without memoization in dependency array causing unnecessary re-renders.

---

## 🔹 8. Questions & Answers for Interviews

### Basic Questions

1. **Purpose of useEffect?**

   * Perform side effects in functional components.
2. **What are side effects?**

   * Operations outside rendering like API calls, timers.
3. **When does useEffect run?**

   * After component renders.
4. **No dependency array?**

   * Runs on every render.
5. **Difference between [] and no array?**

   * [] → runs once, no array → runs every render.

### Intermediate Questions

6. **Dependency array?** - Controls when effect runs.
7. **When dependency changes?** - Effect runs again.
8. **Cleanup function?** - Cleans resources like timers or subscriptions.
9. **When cleanup runs?** - Before next effect or unmount.
10. **Why not async directly?** - Because effect expects cleanup function, not a promise.

### Practical Coding Questions

11. **Run once**

```js
useEffect(() => { console.log("Run once"); }, []);
```

12. **Run on count change**

```js
useEffect(() => { console.log("Count changed"); }, [count]);
```

13. **Timer with cleanup**

```js
useEffect(() => {
  const id = setInterval(() => console.log("Running..."), 1000);
  return () => clearInterval(id);
}, []);
```

14. **API fetch**

```js
useEffect(() => {
  const fetchData = async () => {
    const res = await fetch("https://api.com");
    const data = await res.json();
    console.log(data);
  };
  fetchData();
}, []);
```

15. **Fix infinite loop**

```js
useEffect(() => { setCount(prev => prev + 1); }, []);
```

### Advanced Questions

16. **Why after render?** - Keeps render pure and fast.
17. **useEffect vs useLayoutEffect**
    | Feature | useEffect | useLayoutEffect |
    |---|---|---|
    | Timing | After paint | Before paint |
    | Blocking | No | Yes |
18. **Missing dependency?** - Causes bugs or stale data.
19. **Dependency for performance?** - Prevents unnecessary runs.
20. **Lifecycle relation?** - Mount (runs once), Update (runs on dependency), Unmount (cleanup).

### Tricky Questions

21. **Will this run once?**

```js
useEffect(() => { console.log("Hello"); }, [{}]);
```

* ❌ Runs every render (new object each time)

22. **Why re-render again?**

```js
useEffect(() => { setUser({ name: "Ali" }); }, []);
```

* New object triggers re-render once.

23. **Problem here?**

```js
useEffect(() => { console.log(user.name); }, []);
```

* ❌ user missing in dependency → stale value.

24. **Include functions in dependency?** - Functions can change reference, React needs to track them.
25. **Object in dependency?** - Causes re-run each time due to new reference.

---

# 🎯 Summary for Interviews

* `useEffect` runs **after render**
* Handles **side effects**
* Controlled by **dependency array**
* Can return **cleanup function**
* Always follow best practices to avoid bugs and improve performancememcitePC7
