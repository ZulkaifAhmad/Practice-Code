# Code Splitting — React.lazy, Suspense & dynamic import()

> **Interview Level Notes** | Simple English | React

---

## What is Code Splitting?

When you build a React app, by default **everything gets packed into one big JS file** (called a bundle). The user has to download this whole file before anything shows on screen — even code for pages they will never visit.

**Code Splitting** means breaking that one big file into **smaller pieces (chunks)**, and loading each piece **only when it is needed**.

### Without Code Splitting
```
bundle.js → Home + Dashboard + Admin + Settings + Charts = 2MB 😬
User visits Home → downloads 2MB (even though they don't need Admin or Charts)
```

### With Code Splitting
```
main.js        → shared/core code     (loads immediately)
home.chunk.js  → Home page            (loads when user visits Home)
admin.chunk.js → Admin page           (loads when user visits Admin)
```

**Result:** Faster first load. User only downloads what they need.

---

## Step 1 — The Foundation: `dynamic import()`

This is a **JavaScript feature**, not a React thing.

```js
// Normal import — loads at the start, always
import HeavyComponent from './HeavyComponent';

// Dynamic import — loads only when this line runs
import('./HeavyComponent').then(module => {
  const HeavyComponent = module.default;
});
```

When your bundler (Webpack or Vite) sees `import('./something')`, it **automatically creates a separate chunk** for that file. That is how the split happens at the build level.

---

## Step 2 — `React.lazy()` — Lazy Load a Component

`React.lazy` is React's tool that wraps `dynamic import()` for **components**.

```jsx
// Normal way — loads at start
import HeavyChart from './HeavyChart';

// Lazy way — loads only when first rendered
const HeavyChart = React.lazy(() => import('./HeavyChart'));
```

**Important rule:** The file you import must have a **default export**.

```jsx
// ✅ This works
export default function HeavyChart() { ... }

// ❌ This does NOT work directly with React.lazy
export function HeavyChart() { ... }
```

---

## Step 3 — `Suspense` — Show Something While Loading

When a lazy component is loading (its chunk is downloading), React needs to show **something** to the user. That is what `Suspense` does.

```jsx
import React, { Suspense } from 'react';

const HeavyChart = React.lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyChart />
    </Suspense>
  );
}
```

- `fallback` → what shows **while** the chunk is downloading
- Once downloaded → React swaps the fallback with the real component
- One `Suspense` can wrap **multiple** lazy components

---

## Most Common Pattern — Route-Based Splitting

The best place to split your code is **at the route level**. Each page gets its own chunk.

```jsx
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home      = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin     = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin"     element={<Admin />} />
      </Routes>
    </Suspense>
  );
}
```

Now every page **only downloads its own chunk** when the user navigates to it.

---

## How It Works — Step by Step

```
User visits /dashboard
      ↓
React sees <Dashboard /> is a lazy component
      ↓
Shows <Suspense fallback> immediately (so screen is not blank)
      ↓
Fetches dashboard.chunk.js in the background
      ↓
Chunk loaded → React removes fallback and renders <Dashboard />
```

---

## Gotchas to Remember ⚠️

### 1. Named Exports — Need a Wrapper

`React.lazy` only works with default exports. For named exports, do this:

```jsx
// MyComponent is a named export inside the file
const MyComponent = lazy(() =>
  import('./MyComponents').then(module => ({
    default: module.MyComponent   // wrap it as default
  }))
);
```

### 2. Suspense Must Wrap the Lazy Component

```jsx
// ✅ Correct — Suspense is the parent
<Suspense fallback={<Loader />}>
  <LazyComponent />
</Suspense>

// ❌ Wrong — Suspense must be ABOVE, not beside
<LazyComponent />
<Suspense fallback={<Loader />} />
```

### 3. Handle Load Failures with Error Boundary

If the network is slow or the chunk fails to download, `React.lazy` will throw an error. Wrap with an `ErrorBoundary` to handle this nicely.

```jsx
<ErrorBoundary fallback={<div>Something went wrong. Please refresh.</div>}>
  <Suspense fallback={<Loader />}>
    <LazyPage />
  </Suspense>
</ErrorBoundary>
```

### 4. Does NOT Work with SSR (Server Side Rendering)

`React.lazy` is **client-side only**. If you are using **Next.js**, use `next/dynamic` instead — it works the same way but supports SSR too.

```jsx
// Next.js equivalent
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div>Loading...</div>,
});
```

---

## Quick Comparison Table

| Feature | `React.lazy` | `next/dynamic` |
|---|---|---|
| Works in React (CRA/Vite) | ✅ Yes | ❌ No |
| Works in Next.js | ❌ No | ✅ Yes |
| Needs `Suspense`? | ✅ Yes | Optional |
| Supports SSR? | ❌ No | ✅ Yes |
| Named export support? | Manual wrapper | Built-in option |

---

## Interview Answer — Say This Out Loud

> *"By default, React bundles everything into one big file. This makes the first load slow because the user downloads code they may never use. Code splitting fixes this by breaking the bundle into smaller chunks that load on demand.*
>
> *In React, we do this using `React.lazy()` with a dynamic `import()`. When the bundler — like Webpack or Vite — sees a dynamic import, it automatically creates a separate chunk for that module. `React.lazy` tells React to only fetch that chunk when the component is actually rendered for the first time.*
>
> *Since there is a short wait while the chunk downloads, we wrap the lazy component inside a `Suspense` boundary, which shows a fallback UI in the meantime. The most common use case is route-level splitting — each page loads its own chunk — which greatly improves initial load time because users only download what they visit.*
>
> *One thing to note: `React.lazy` only works on the client side. In Next.js, we use `next/dynamic` instead, which does the same job but also supports server-side rendering."*

---

## Key Points Summary

- **Code Splitting** = break one big bundle into small chunks, load on demand
- **`dynamic import()`** = the JS feature that tells the bundler to split
- **`React.lazy()`** = React's wrapper to lazy load a component
- **`Suspense`** = shows a fallback while the chunk is loading
- **Route-level splitting** = most common and most impactful use case
- **Error Boundary** = needed to handle chunk load failures
- **`next/dynamic`** = use this in Next.js instead of `React.lazy`