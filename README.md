# ⚛️ How React Renders — Complete Guide

> Render → Commit → Paint | Re-render Triggers | React 18 Concurrent Mode

---

## 📌 Table of Contents

1. [The 3 Phases of React Rendering](#1-the-3-phases-of-react-rendering)
   - [Render Phase](#-render-phase)
   - [Commit Phase](#-commit-phase)
   - [Paint Phase](#-paint-phase)
2. [What Triggers a Re-render?](#2-what-triggers-a-re-render)
3. [React 18 Concurrent Mode](#3-react-18-concurrent-mode)
4. [Full Picture Diagram](#4-full-picture-diagram)
5. [Interview One-liner](#5-interview-one-liner)

---

## 1. The 3 Phases of React Rendering

```
State / Props Change
        ↓
   🔄 RENDER PHASE
        ↓
   ✅ COMMIT PHASE
        ↓
   🎨 PAINT PHASE
```

---

### 🔄 Render Phase

React **calls your component functions**, builds a new Virtual DOM,
and diffs it against the old one to figure out **what changed.**

```jsx
// React "renders" this — meaning it CALLS this function
const App = () => {
  return <h1>Hello</h1>; // builds new VDOM
};
```

**What happens step by step:**

- Component function is called
- JSX → `React.createElement()` → React Element (plain JS object)
- New Virtual DOM is built
- New VDOM is **diffed** against old VDOM (reconciliation)
- React calculates the **minimum changes needed**

> ⚠️ **Important:** The Render Phase does NOT touch the real DOM yet.
> It is just React doing calculation work **in memory.**

**The React Element (plain JS object) looks like this:**

```js
{
  type: "h1",
  props: { className: "title" },
  children: "Hello"
}
```

---

### ✅ Commit Phase

React takes the **diff result** from the Render Phase and
**actually updates the real DOM.**

**What happens:**

- Inserts, updates, or removes real DOM nodes
- Runs `useLayoutEffect` (synchronously, before paint)
- Runs `useEffect` (after paint)

> ⚠️ **Important:** The Commit Phase is **synchronous and cannot
> be interrupted** — React must finish applying changes before
> anything else happens.

```jsx
useLayoutEffect(() => {
  // Runs after DOM update, before browser paint
  // Good for: measuring DOM elements
}, []);

useEffect(() => {
  // Runs after browser paint
  // Good for: API calls, subscriptions, timers
}, []);
```

---

### 🎨 Paint Phase

This phase is handled by the **browser, not React.**

- Browser takes the updated DOM
- Calculates layout and styles
- Visually **paints pixels** on the screen

React has **no control** over this phase.

---

### 🏗️ Simple Analogy

| Phase | Analogy |
|-------|---------|
| Render Phase | Architect draws the blueprint |
| Commit Phase | Builder constructs the changes |
| Paint Phase | You visually see the building |

---

## 2. What Triggers a Re-render?

React re-renders a component when **any of these 4 things change:**

---

### 1️⃣ useState — State Changes

```jsx
const [count, setCount] = useState(0);

setCount(1); // ✅ triggers re-render
```

---

### 2️⃣ useReducer — Dispatch Called

```jsx
const [state, dispatch] = useReducer(reducer, initialState);

dispatch({ type: "INCREMENT" }); // ✅ triggers re-render
```

---

### 3️⃣ Props Change

When a **parent re-renders**, the child re-renders too
(even if props didn't actually change — unless memoized).

```jsx
const Parent = () => {
  const [name, setName] = useState("Zulkaif");

  return <Child name={name} />;
  // If name changes → Child re-renders ✅
};
```

---

### 4️⃣ Context Value Changes

Any component **consuming** a context re-renders when
the context value changes.

```jsx
<AuthContext.Provider value={newValue}>
  <App /> {/* re-renders when newValue changes ✅ */}
</AuthContext.Provider>
```

---

### ❌ What Does NOT Trigger a Re-render

```jsx
// Regular variables — React does NOT watch these
let name = "Zulkaif";
name = "Ahmed"; // ❌ NO re-render

// Object mutation — React does NOT detect this
const [user, setUser] = useState({ name: "Zulkaif" });
user.name = "Ahmed"; // ❌ NO re-render

// Correct way — always return a NEW object
setUser({ ...user, name: "Ahmed" }); // ✅ re-render
```

> 💡 **Key Rule:** React only watches **state and props.**
> Mutating variables or objects directly will never cause a re-render.

---

## 3. React 18 Concurrent Mode

### The Old Problem (React 17 and before)

Rendering was **fully synchronous (blocking).**
Once React started rendering, it couldn't stop.
Heavy renders would **freeze the UI.**

```
// Old React — Blocking Render
Start Render ─────────────────────────► Done
             ↑
        (Browser frozen here — can't respond to user input)
```

---

### React 18 Solution — Interruptible Rendering

React 18 makes the **Render Phase interruptible.**
React can now **pause, resume, and abandon** renders mid-way
to keep the UI responsive.

```
// React 18 — Concurrent Render
Start Render ──► Pause ──► Handle user click ──► Resume ──► Done
```

> ⚠️ **Only the Render Phase is interruptible.**
> The Commit Phase is still synchronous.

---

### Key React 18 Concurrent Features

---

#### ⚡ `useTransition` — Mark Updates as Non-Urgent

Separates **urgent** updates (typing, clicking) from
**non-urgent** updates (heavy filtering, searching).

```jsx
const [isPending, startTransition] = useTransition();

const handleSearch = (e) => {
  // Urgent — updates immediately
  setInputValue(e.target.value);

  // Non-urgent — React can pause/interrupt this
  startTransition(() => {
    setSearchResults(heavyFilter(data));
  });
};

return (
  <>
    <input onChange={handleSearch} />
    {isPending ? <p>Loading...</p> : <Results data={searchResults} />}
  </>
);
```

---

#### ⏳ `useDeferredValue` — Defer a Value Update

React renders with the **old value first**, then updates
when it has free time. Similar to debouncing but built into React.

```jsx
const [query, setQuery] = useState("");
const deferredQuery = useDeferredValue(query);

// deferredQuery updates after urgent renders are done
return <HeavyList filter={deferredQuery} />;
```

---

#### 🔄 Automatic Batching

Before React 18, multiple state updates inside `setTimeout`,
`fetch`, or event handlers caused **multiple re-renders.**

React 18 **automatically batches** all state updates into
**one single re-render** no matter where they happen.

```jsx
// ❌ Before React 18 — 2 separate re-renders
setTimeout(() => {
  setCount(1);    // re-render 1
  setName("Ali"); // re-render 2
}, 1000);

// ✅ React 18 — Automatically batched into 1 re-render
setTimeout(() => {
  setCount(1);
  setName("Ali"); // only 1 re-render total 🎉
}, 1000);
```

---

#### 🔁 `startTransition` vs `useDeferredValue`

| | `useTransition` | `useDeferredValue` |
|---|---|---|
| **You control** | The state setter | The derived value |
| **Use when** | You own the state update | You receive value as prop |
| **Returns** | `[isPending, startTransition]` | deferred version of value |

---

## 4. Full Picture Diagram

```
  User Action (click, type, etc.)
            │
            ▼
  State / Props / Context Changes
            │
            ▼
  ┌─────────────────────────────────┐
  │         🔄 RENDER PHASE         │
  │  - Call component functions     │
  │  - JSX → React.createElement()  │
  │  - Build new Virtual DOM        │
  │  - Diff old VDOM vs new VDOM    │
  │  - Calculate minimum changes    │
  │  ✨ React 18: Interruptible!    │
  └─────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────────┐
  │         ✅ COMMIT PHASE         │
  │  - Apply changes to real DOM    │
  │  - Run useLayoutEffect          │
  │  - Run useEffect                │
  │  ⚠️ Synchronous, uninterrupted  │
  └─────────────────────────────────┘
            │
            ▼
  ┌─────────────────────────────────┐
  │         🎨 PAINT PHASE          │
  │  - Browser paints pixels        │
  │  - React has no control here    │
  └─────────────────────────────────┘
            │
            ▼
       User sees update ✅
```

---

## 5. Interview One-liner

> *"React rendering has 3 phases — the Render Phase where React
> diffs the Virtual DOM, the Commit Phase where it applies changes
> to the real DOM and runs effects, and the Paint Phase where the
> browser draws pixels. Re-renders are triggered by state, props,
> context, or reducer changes — not regular variables. React 18
> Concurrent Mode makes the Render Phase interruptible so heavy
> renders don't freeze the UI, using features like useTransition,
> useDeferredValue, and automatic batching."*

---

*Made for interview prep — React Internals Series* 🚀