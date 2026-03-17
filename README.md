# JSX Compilation to React.createElement

A complete guide covering how JSX works under the hood — from source code to pixels on screen.

---

## Table of Contents

- [What is JSX?](#what-is-jsx)
- [What is a JSX Expression?](#what-is-a-jsx-expression)
- [What is Babel?](#what-is-babel)
- [JSX → React.createElement](#jsx--reactcreateelement)
- [What React.createElement Returns](#what-reactcreateelement-returns)
- [How React Works End to End](#how-react-works-end-to-end)
- [What Happens When State Changes](#what-happens-when-state-changes)
- [useState and Functional Updates](#usestate-and-functional-updates)
- [Key Terms](#key-terms)

---

## What is JSX?

JSX stands for **JavaScript XML**. It is a syntax extension for JavaScript that lets you write HTML-like markup directly inside your JS files.

```jsx
const element = <h1 className="title">Hello World</h1>;
```

> **Important:** JSX is not valid JavaScript. Browsers cannot execute JSX directly. It must be compiled first.

---

## What is a JSX Expression?

A **JSX expression** is any piece of JSX syntax that evaluates to a single React element.

Just like a JavaScript expression produces a value:
```js
5 + 3        // evaluates to → 8
"hello"      // evaluates to → "hello"
```

A JSX expression produces a React element object:
```jsx
<h1>Hello</h1>   // evaluates to → React element object
```

### Rules

**1. Must have exactly one root element**
```jsx
// ❌ Invalid — two root elements
<h1>Title</h1>
<p>Text</p>

// ✅ Valid — wrapped in a Fragment
<>
  <h1>Title</h1>
  <p>Text</p>
</>
```

**2. Evaluates to a value** — it returns a React element object, not HTML.

**3. Gets compiled** — Babel converts it to a `React.createElement()` call.

### JavaScript Inside JSX

You can embed JavaScript expressions inside JSX using `{ }`:

```jsx
<h1>Hello, {user.name}</h1>
//           ^^^^^^^^^^^
//           JS expression living inside JSX (not a JSX expression itself)
```

The `{ }` is an escape hatch — it tells Babel: *"stop reading JSX here, this part is plain JavaScript."*

| Term | What it means |
|---|---|
| JSX expression | The whole JSX element — `<div>...</div>` |
| JS expression in JSX | JavaScript code inside `{ }` within JSX |

---

## What is Babel?

Babel is a **JavaScript transpiler**. Its job:

> Take modern or non-standard JavaScript → convert it → into JavaScript that all browsers can understand.

Browsers never understand JSX. Babel sits between your code and the browser and acts as a translator.

### How Babel Works Internally

Babel processes your code in three steps:

**1. Parsing** — reads your source code and converts it into an AST (Abstract Syntax Tree):
```
Your code (string) → Babel Parser → AST (object tree)
```

**2. Transformation** — walks through the AST and modifies it using plugins:
- `@babel/plugin-transform-react-jsx` → rewrites JSX nodes as `React.createElement()` calls
- `@babel/plugin-transform-arrow-functions` → rewrites arrow functions as regular functions

**3. Code Generation** — converts the modified AST back into a plain JavaScript string:
```
Modified AST → Babel Generator → Plain JS (browser-ready)
```

### Full Babel Pipeline

```
Your JSX / Modern JS
        ↓
   Babel Parser
        ↓
       AST
        ↓
  Babel Plugins (transform)
        ↓
  Modified AST
        ↓
  Babel Generator
        ↓
Plain JS (browser-ready)
```

---

## JSX → React.createElement

### Classic Transform (pre-React 17)

Every JSX tag compiles to a `React.createElement()` call with three arguments:

```
React.createElement( type, props, ...children )
```

| Argument | What it is |
|---|---|
| `type` | String for HTML tags (`"div"`) or a function for components (`App`) |
| `props` | Object of attributes, or `null` if none |
| `children` | Strings, numbers, or nested `createElement` calls |

### Example

You write:
```jsx
function App() {
  return (
    <div className="container">
      <h1>Hello World</h1>
      <p>Welcome to React</p>
    </div>
  );
}
```

Babel compiles it to:
```js
function App() {
  return React.createElement(
    "div",                        // type
    { className: "container" },   // props
    React.createElement(          // child 1
      "h1",
      null,
      "Hello World"
    ),
    React.createElement(          // child 2
      "p",
      null,
      "Welcome to React"
    )
  );
}
```

Children become additional arguments to the parent `createElement` call.

### Modern Transform (React 17+)

JSX now compiles to `_jsx()` imported automatically from `react/jsx-runtime`:

```js
import { jsx as _jsx } from "react/jsx-runtime";
const element = _jsx("div", { className: "box", children: "Hello" });
```

This is why modern React projects **no longer need** `import React from 'react'` at the top of every file.

---

## What React.createElement Returns

`React.createElement` does not return HTML. It returns a **plain JavaScript object** — the React element (virtual DOM node):

```js
{
  $$typeof: Symbol(react.element),
  type: "div",
  props: {
    className: "container",
    children: [
      {
        $$typeof: Symbol(react.element),
        type: "h1",
        props: { children: "Hello World" },
        key: null,
        ref: null
      },
      {
        $$typeof: Symbol(react.element),
        type: "p",
        props: { children: "Welcome to React" },
        key: null,
        ref: null
      }
    ]
  },
  key: null,
  ref: null
}
```

### Why $$typeof: Symbol?

This is a **security measure** against XSS attacks. Since you cannot serialize a Symbol to JSON, a server cannot inject a malicious fake React element through a JSON response. React checks this symbol before rendering any element.

---

## How React Works End to End

### Phase 1 — You Write Code

You write components in `.jsx` files. Nothing has happened yet — this is just source code.

### Phase 2 — Build Tool (Vite / Webpack)

Running `npm run dev` triggers your build tool which:
1. Finds all your files and maps the dependency tree
2. Hands JSX files to Babel/SWC for compilation

### Phase 3 — Browser Loads the App

The browser loads `index.html` which contains:
```html
<div id="root"></div>
```
Then loads your compiled JavaScript bundle. When the bundle runs, this line triggers React:
```js
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

### Phase 4 — Initial Render (First Paint)

**Step 1 — Rendering**
React calls your component functions. They return JSX → compiled to `createElement()` → returns virtual DOM object tree. Nothing is on screen yet.

**Step 2 — Reconciliation**
On first render there is nothing to compare against. React marks everything as "needs to be created."

**Step 3 — Commit**
ReactDOM creates actual DOM nodes and inserts them into `<div id="root">`:

```
Virtual DOM object          Real DOM
──────────────────          ─────────────────────────────
type: "div"        →        document.createElement("div")
type: "h1"         →        document.createElement("h1")
textContent: "0"   →        h1.textContent = "0"
type: "button"     →        document.createElement("button")
onClick: fn        →        button.addEventListener("click", fn)
```

The browser paints the UI. The user sees the screen for the first time.

### Phase 5 — Fiber Tree

Internally React builds a **Fiber tree** alongside the virtual DOM. Each fiber is a JS object holding:
- The component type
- Its props and state
- References to parent, child, and sibling fibers
- The work to be done

React keeps **two fiber trees** in memory:
- **Current tree** — what is on screen right now
- **Work-in-progress tree** — what React is building for the next render

This double-buffering makes updates smooth and safe.

---

## What Happens When State Changes

### Step 1 — setState is Called

```js
setCount(count + 1);
```

React does not immediately re-render. It **schedules** the update.

### Step 2 — Batching

Multiple `setState` calls in the same event are batched into one single re-render:

```js
setCount(count + 1);   // these two get batched
setName("Ali");        // → only ONE re-render
```

### Step 3 — Re-Render

React calls your component again with the new state. A new virtual DOM tree is built in memory.

### Step 4 — Diffing Algorithm

React compares old virtual DOM vs new virtual DOM using three rules:

**Rule 1 — Different type → destroy and rebuild**
```jsx
// old: <div>Hello</div>
// new: <span>Hello</span>
// React destroys the div and builds a fresh span
```

**Rule 2 — Same type → update only what changed**
```jsx
// old: <h1>0</h1>
// new: <h1>1</h1>
// React keeps the h1, only updates textContent
```

**Rule 3 — Lists use the key prop**
```jsx
{items.map(item => <li key={item.id}>{item.name}</li>)}
```
Keys let React match old and new list items correctly instead of rebuilding the entire list.

### Step 5 — Minimal DOM Update

React commits only the changes it identified:

```js
h1.textContent = "1";   // only this touches the DOM
```

Everything else is untouched. This is the core performance advantage of the virtual DOM.

### Full Update Cycle

```
setState called
      ↓
Update batched and scheduled
      ↓
Component re-renders → new virtual DOM built
      ↓
Diffing algorithm compares old vs new
      ↓
Only changed nodes committed to real DOM
      ↓
Browser repaints only affected pixels
```

---

## useState and Functional Updates

### The Problem — Stale State

Calling `setState` twice with a direct value does **not** give you what you expect:

```jsx
// ❌ Wrong — both reads stale count value
<button onClick={() => {
  setCount(count + 1);   // reads count = 0, schedules → 1
  setCount(count + 1);   // reads count = 0, schedules → 1 again
}}>
```

Both calls read the same stale `count` from the closure. Result: count goes to `1`, not `2`.

### The Solution — Functional Update Form

Pass a function instead of a value. React processes them in a queue, each receiving the latest state:

```jsx
// ✅ Correct — each call gets latest value
<button onClick={() => {
  setCount(prev => prev + 1);   // prev = 0 → returns 1
  setCount(prev => prev + 1);   // prev = 1 → returns 2
}}>
```

| Call | `prev` received | Returns |
|---|---|---|
| First | `0` | `1` |
| Second | `1` | `2` |

Each call in the queue receives the result of the previous call — not the stale closure value.

---

## Key Terms

| Term | Definition |
|---|---|
| **JSX** | Syntax extension that lets you write HTML-like markup in JavaScript |
| **JSX Expression** | A piece of JSX with one root element that evaluates to a React element object |
| **Babel** | JavaScript transpiler that compiles JSX into `React.createElement()` calls |
| **AST** | Abstract Syntax Tree — a structured object representation of your code |
| **React.createElement** | Function that takes type, props, children and returns a React element object |
| **Virtual DOM** | A JavaScript object tree in memory representing what the UI should look like |
| **Fiber** | React's internal unit of work — a JS object tracking a component's state and rendering work |
| **Reconciliation** | The process of comparing old and new virtual DOM trees |
| **Diffing** | The algorithm React uses during reconciliation to find minimum changes |
| **Commit Phase** | When React applies the calculated changes to the real DOM |
| **Batching** | React grouping multiple setState calls into one re-render |
| **Functional Update** | Passing a function to setState (`prev => prev + 1`) to get the latest state value |

---

> **One line summary:** JSX is compiled by Babel into `React.createElement()` calls which return virtual DOM objects. ReactDOM converts those objects into real DOM nodes. When state changes, React rebuilds the virtual DOM, diffs it against the old one, and commits only the minimum changes to the real DOM.