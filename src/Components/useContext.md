# React `useContext` Hook — Interview Preparation Notes

> **Author:** Zulkaif Ahmad | **Topic:** React Context API & `useContext` Hook  
> **Level:** Beginner → Interview-Ready

---

## Table of Contents

1. [What is Context?](#1-what-is-context)
2. [What is `useContext`?](#2-what-is-usecontext)
3. [Why Do We Use It?](#3-why-do-we-use-it)
4. [The Problem It Solves — Prop Drilling](#4-the-problem-it-solves--prop-drilling)
5. [How to Use Context (Step-by-Step)](#5-how-to-use-context-step-by-step)
6. [Custom Context Hook Pattern](#6-custom-context-hook-pattern)
7. [Performance Considerations](#7-performance-considerations)
8. [When to Use Context vs Props vs Redux](#8-when-to-use-context-vs-props-vs-redux)
9. [Common Patterns](#9-common-patterns)
10. [Interview Questions & Answers](#10-interview-questions--answers)
11. [Quick Revision Cheatsheet](#11-quick-revision-cheatsheet)

---

## 1. What is Context?

**React Context** is a built-in feature that allows you to share data across the entire component tree **without passing props manually at every level**.

Think of it like a "global variable" for your component tree — but reactive (any change automatically re-renders all consumers).

### Real-world analogy

Imagine a restaurant. The **head chef** (Provider) prepares the food (data). Any **waiter** (consumer) in the restaurant can pick up that food without it being passed waiter-to-waiter manually. Context is the kitchen window between them.

---

## 2. What is `useContext`?

`useContext` is a **React Hook** that lets functional components **subscribe to and read** a Context value.

```js
const value = useContext(MyContext);
```

- It takes a **Context object** (created by `createContext`) as its argument.
- It returns the current **value** from the nearest matching `Provider` above it in the tree.
- When the Provider's `value` changes, this component **automatically re-renders**.

---

## 3. Why Do We Use It?

| Without Context | With Context |
|---|---|
| Pass props through every layer | Any component reads data directly |
| Middle components receive props they don't need | Middle components stay clean |
| Hard to maintain when tree grows deep | Easy to scale |
| Refactoring is painful | Change one Provider, all consumers update |

### Use Context for truly global data:

- **Authentication** — current user, login/logout
- **Theme** — dark/light mode
- **Language / i18n** — locale, translations
- **Notifications** — toast messages
- **Shopping Cart** — items shared across pages

---

## 4. The Problem It Solves — Prop Drilling

**Prop drilling** = passing data through components that don't need it, just to get it to a deeply nested child.

```jsx
// ❌ BAD — Prop Drilling
function App() {
  const user = { name: "Zulkaif" };
  return <Layout user={user} />;
}

function Layout({ user }) {
  // Layout doesn't need user — just passing it down
  return <Sidebar user={user} />;
}

function Sidebar({ user }) {
  // Sidebar doesn't need user either — just passing it down
  return <UserCard user={user} />;
}

function UserCard({ user }) {
  // Only THIS component actually uses user
  return <p>{user.name}</p>;
}
```

```jsx
// ✅ GOOD — With Context
const UserContext = createContext(null);

function App() {
  const user = { name: "Zulkaif" };
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}

function Layout() { return <Sidebar />; }     // clean — no props
function Sidebar() { return <UserCard />; }   // clean — no props

function UserCard() {
  const user = useContext(UserContext);        // reads directly
  return <p>{user.name}</p>;
}
```

---

## 5. How to Use Context (Step-by-Step)

### Step 1 — Create the Context

```js
// ThemeContext.js
import { createContext } from 'react';

// The argument is the default value (used only if no Provider exists above)
export const ThemeContext = createContext('light');
```

---

### Step 2 — Provide the value (wrap your component tree)

```jsx
// App.js
import { useState } from 'react';
import { ThemeContext } from './ThemeContext';

function App() {
  const [theme, setTheme] = useState('light');

  return (
    // value prop = what all consumers will receive
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  );
}
```

---

### Step 3 — Consume the value with `useContext`

```jsx
// Button.js — could be 5 levels deep, doesn't matter
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function Button() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

---

## 6. Custom Context Hook Pattern

This is the **production-standard pattern**. Instead of exposing the raw Context, wrap it in a custom hook.

```jsx
// ThemeContext.js — full production-ready setup
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null); // null so we can detect missing Provider

// Provider component — wraps part of your app
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook — the only way consumers access the context
export function useTheme() {
  const ctx = useContext(ThemeContext);

  // Safety check: throw if used outside the Provider
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }

  return ctx;
}
```

```jsx
// Button.js — consumer never imports ThemeContext directly
import { useTheme } from './ThemeContext';

function Button() {
  const { theme, setTheme } = useTheme(); // clean API
  return <button onClick={() => setTheme('dark')}>{theme}</button>;
}
```

### Why is this better?

- Consumers never know how context is implemented (easy to refactor)
- The error message tells you exactly what went wrong
- All context logic lives in one file

---

## 7. Performance Considerations

### The core problem

Every time the Provider's `value` changes, **all consumers re-render** — even if they only use part of the value.

```jsx
// ❌ BAD — new object reference on every render = all consumers re-render
<Context.Provider value={{ theme, user, cart }}>
```

```jsx
// ✅ GOOD — memoize the value
const value = useMemo(() => ({ theme, user, cart }), [theme, user, cart]);
<Context.Provider value={value}>
```

---

### Critical gotcha — `React.memo` does NOT protect against Context

```jsx
// React.memo ONLY prevents re-renders from changed props.
// If the component consumes a context, it WILL re-render when context changes
// regardless of React.memo.

const MyComponent = React.memo(() => {
  const { theme } = useTheme(); // ← context consumer
  return <div>{theme}</div>;
  // re-renders when theme changes — React.memo cannot stop this
});
```

---

### Fix — Split into multiple contexts

```jsx
// Separate state and dispatch into two contexts
const StateCtx    = createContext(null);
const DispatchCtx = createContext(null);

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <DispatchCtx.Provider value={dispatch}>  {/* dispatch never changes */}
      <StateCtx.Provider value={state}>
        {children}
      </StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}

// Components that only dispatch won't re-render when state changes
function AddToCartButton() {
  const dispatch = useContext(DispatchCtx); // stable reference
  return <button onClick={() => dispatch({ type: 'ADD', id: 1 })}>Add</button>;
}
```

---

## 8. When to Use Context vs Props vs Redux

```
Data passes 1–2 levels deep?
  → Use Props ✅

Data is needed by many components at any depth, changes infrequently?
  → Use Context ✅

Data changes frequently (e.g., every second), or complex async logic needed?
  → Use Redux Toolkit ✅
```

| Criteria | Props | Context | Redux Toolkit |
|---|---|---|---|
| Setup | Zero | Minimal | Moderate |
| Bundle size | — | Zero | ~47kb |
| Re-render optimization | Manual | Manual (useMemo) | Selectors (automatic) |
| DevTools | None | None | Excellent |
| Async handling | Manual | Manual | RTK Query built-in |
| Best for | Parent → child | Global, low-freq | Large app, high-freq |

---

## 9. Common Patterns

### Pattern 1 — Context + useReducer (recommended for complex state)

```jsx
const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD':    return { ...state, items: [...state.items, action.item] };
    case 'REMOVE': return { ...state, items: state.items.filter(i => i.id !== action.id) };
    default:       return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
```

---

### Pattern 2 — Nested providers (one per concern)

```jsx
// index.js or App.js
<AuthProvider>
  <ThemeProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </ThemeProvider>
</AuthProvider>
```

Each provider is independent. A theme change doesn't re-render cart consumers.

---

### Pattern 3 — Scoped context (override in a subtree)

```jsx
// You can have multiple Providers of the same context
// Each useContext reads from the nearest one above it

<ThemeContext.Provider value="light">
  <Header />  {/* reads "light" */}

  <ThemeContext.Provider value="dark">
    <Modal />   {/* reads "dark" — overridden for this subtree */}
  </ThemeContext.Provider>
</ThemeContext.Provider>
```

---

## 10. Interview Questions & Answers

---

### Q1. What is React Context and what problem does it solve?

**Answer:**

React Context is a built-in API that lets you share data across the component tree without prop drilling — the practice of passing props through intermediate components that don't actually need the data. It provides a `Provider` that wraps part of the tree with a value, and a `useContext` hook that any descendant can use to read that value. It's best for global concerns that don't change frequently — like authentication state, theme, or language settings.

---

### Q2. What is the difference between `createContext` and `useContext`?

**Answer:**

`createContext` is called once to **create the Context object** — it defines what the context is and its default value. It returns an object with a `.Provider` component and is typically stored in a file.

`useContext` is a hook called inside components to **subscribe to and read** from that context. It takes the Context object as an argument and returns the current value from the nearest Provider above in the tree.

In short: `createContext` creates the channel, `useContext` reads from it.

---

### Q3. When is the default value of `createContext` used?

**Answer:**

The default value is only used when a component calls `useContext` but there is **no matching Provider anywhere above it in the tree**. It is NOT the initial state of the Provider — it's a fallback for the case where the component is rendered outside the Provider entirely.

This is useful for testing components in isolation without wrapping them in a Provider. In production, many developers pass `null` as the default and throw an error inside the custom hook if the context is null — which gives a helpful error message if a developer forgets to add the Provider.

---

### Q4. Does `React.memo` prevent re-renders caused by Context changes?

**Answer:**

No, and this is a common misconception. `React.memo` only prevents re-renders triggered by **changed props**. It has no effect on Context. If a memoized component consumes a context and the context value changes, the component will still re-render — `React.memo` is completely bypassed.

To reduce unnecessary re-renders from Context, you should:
1. Memoize the context value using `useMemo`
2. Split into multiple contexts (e.g. separate state and dispatch)
3. Keep each context small and focused

---

### Q5. How would you optimize a Context to prevent unnecessary re-renders?

**Answer:**

Three strategies:

**First**, memoize the value passed to the Provider:
```js
const value = useMemo(() => ({ user, setUser }), [user]);
<UserContext.Provider value={value}>
```

**Second**, split state and dispatch into two separate contexts. The `dispatch` function from `useReducer` is stable — it never changes. Components that only dispatch don't need to re-render when state updates:
```js
<DispatchCtx.Provider value={dispatch}>
  <StateCtx.Provider value={state}>
```

**Third**, keep contexts focused. A single massive context causes everything to re-render when any part of it changes. Separate `AuthContext`, `ThemeContext`, and `CartContext` means a theme change only re-renders theme consumers.

---

### Q6. Can you have multiple Providers of the same context?

**Answer:**

Yes. `useContext` always reads from the **nearest Provider above it** in the component tree. This allows you to scope a context to a subtree and override the outer value.

For example, a Modal component can wrap its children in its own `ThemeContext.Provider` with `value="dark"` while the rest of the app uses `"light"`. Components inside the modal read the inner Provider, everything outside reads the outer one.

---

### Q7. What is the difference between Context and Redux Toolkit?

**Answer:**

Context is built into React — zero dependencies, simple API. It's great for global state that doesn't change frequently, like auth or theme.

Redux Toolkit is an external library. The key difference is **re-render optimization** — Redux uses selectors, so a component only re-renders when the specific slice of state it subscribes to changes. With Context, every consumer re-renders when the value changes, regardless of whether the part they use changed.

Redux also provides middleware, RTK Query for data fetching, and excellent DevTools.

I use Context for things like auth and theme, and Redux Toolkit for complex state with frequent updates, async operations, or where I need fine-grained re-render control.

---

### Q8. What happens if you call `useContext` outside a function component?

**Answer:**

It throws an error: *"Invalid hook call. Hooks can only be called inside the body of a function component."* All React hooks, including `useContext`, must be called at the top level of a functional component or inside a custom hook — never in class components, regular functions, or conditionally.

---

### Q9. How is `useContext` different from the old `Context.Consumer` API?

**Answer:**

`Context.Consumer` was the older pattern, used before hooks existed:
```jsx
<ThemeContext.Consumer>
  {(theme) => <Button theme={theme} />}
</ThemeContext.Consumer>
```

It required a render prop pattern which added nesting and was harder to read. `useContext` replaces this entirely — it's a single line, reads linearly, and works cleanly inside the component body. The `Context.Consumer` API still exists but is rarely used in modern React.

---

### Q10. Can Context replace all use of Redux in a large application?

**Answer:**

Technically possible, but not recommended for large apps. The main issues are performance — Context has no built-in selector optimization, so frequent state updates cause excessive re-renders across the tree — and complexity, since handling async operations, middleware, and complex state logic without Redux requires significant custom code.

Context is excellent for genuinely global, low-frequency data. For anything complex, high-frequency, or that needs DevTools and middleware, Redux Toolkit is the more appropriate tool. They solve different problems and can coexist in the same application.

---

## 11. Quick Revision Cheatsheet

```
createContext(default)    → creates the context
<Ctx.Provider value={}>  → provides the value to the tree
useContext(Ctx)           → reads the value in a consumer

Default value             → only used when NO Provider is above
React.memo                → does NOT block context re-renders
useMemo on value          → prevents unnecessary re-renders
Split contexts            → state + dispatch separation pattern
Custom hook               → production-standard pattern, add safety check
Multiple Providers        → useContext reads from the nearest one

Use Context for:          auth, theme, locale, notifications
Use Redux for:            frequent updates, async, large apps
Use Props for:            1-2 levels of passing
```

---

> **Tip for interviews:** Always mention the `React.memo` + Context gotcha and the custom hook pattern — these show you understand production React, not just the basics.