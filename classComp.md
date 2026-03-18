# React Class Components — Complete Guide

---

## What is a Class Component?

A class component is a **JavaScript class** that extends `React.Component` and must have a `render()` method that returns JSX.
It is the **old way** of writing React components before hooks were introduced in React 16.8.

```jsx
import React, { Component } from 'react'

class MyComponent extends Component {
  render() {
    return <div>Hello from Class Component</div>
  }
}

export default MyComponent
```

---

## Core Syntax Structure

```jsx
import React, { Component } from 'react'

class ClassComp extends Component {

  // 1. Constructor — initialize state
  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      name: "Zulkaif"
    }
  }

  // 2. Custom method (arrow function to avoid 'this' binding issue)
  handleClick = () => {
    this.setState({ count: this.state.count + 1 })
  }

  // 3. Lifecycle methods
  componentDidMount() {}
  componentDidUpdate(prevProps, prevState) {}
  componentWillUnmount() {}

  // 4. render — MANDATORY
  render() {
    return (
      <div>
        <h1>{this.state.name}</h1>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>Click Me</button>
      </div>
    )
  }
}

export default ClassComp
```

---

## Constructor & super(props)

### Why constructor?
- Used to **initialize state** before the component renders
- Runs **automatically** when the component is created
- Must call `super(props)` first — or `this.props` will be undefined

```jsx
constructor(props) {
  super(props)         // calls React.Component's constructor first
  this.state = {
    user: null,
    loading: true
  }
}
```

### Why super(props)?
Your class `extends Component` — meaning it inherits from React's Component class.
`super(props)` runs the **parent class constructor** before yours. Without it — the app breaks.

---

## State Management

```jsx
// Initialize
this.state = { count: 0 }

// Read
this.state.count

// Update — always use setState(), never mutate directly
this.setState({ count: this.state.count + 1 })

// ❌ NEVER do this
this.state.count = 1
```

### setState is asynchronous

```jsx
// ✅ Safe way when new state depends on old state
this.setState(prevState => ({
  count: prevState.count + 1
}))
```

---

## Props

```jsx
// Parent
<UserCard name="Zulkaif" age={21} />

// Child — access via this.props
render() {
  return (
    <div>
      <h2>{this.props.name}</h2>
      <p>Age: {this.props.age}</p>
    </div>
  )
}
```

---

## Lifecycle Methods — Full Diagram

```
MOUNTING           UPDATING              UNMOUNTING
─────────────────────────────────────────────────────
constructor()      render()              componentWillUnmount()
render()           componentDidUpdate()
componentDidMount()
```

---

## 1. Mounting Phase — Component is being created

### `constructor(props)`
- First method to run
- Initialize state here

```jsx
constructor(props) {
  super(props)
  this.state = { data: null }
}
```

### `render()`
- **Mandatory** — React calls this to know what to display
- Must be **pure** — no side effects here
- Runs on every state/props change

```jsx
render() {
  return <div>{this.state.data}</div>
}
```

### `componentDidMount()`
- Runs **once** after component appears on screen
- Best place for API calls, subscriptions, DOM manipulation

```jsx
componentDidMount() {
  fetch('https://api.example.com/user')
    .then(res => res.json())
    .then(data => this.setState({ data }))
}
```

---

## 2. Updating Phase — State or Props changed

### `componentDidUpdate(prevProps, prevState)`
- Runs after **every re-render**
- Always compare before doing anything — avoid infinite loops

```jsx
componentDidUpdate(prevProps, prevState) {
  if (prevState.count !== this.state.count) {
    console.log("count changed:", this.state.count)
  }

  if (prevProps.userId !== this.props.userId) {
    this.fetchUser(this.props.userId) // fetch new user when prop changes
  }
}
```

---

## 3. Unmounting Phase — Component is being removed

### `componentWillUnmount()`
- Runs **before** the component is removed from the DOM
- Clean up — clear timers, cancel subscriptions, remove event listeners

```jsx
componentWillUnmount() {
  clearInterval(this.timer)
  window.removeEventListener('resize', this.handleResize)
}
```

---

## Complete Working Example — Counter App

```jsx
import React, { Component } from 'react'

class Counter extends Component {

  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      message: "Not started"
    }
  }

  // Mounting — runs once after first render
  componentDidMount() {
    console.log("Counter mounted!")
    this.setState({ message: "Counter is ready" })
  }

  // Updating — runs after every state/props change
  componentDidUpdate(prevState) {
    if (prevState.count !== this.state.count) {
      console.log("Count updated to:", this.state.count)
    }
  }

  // Unmounting — runs before removal
  componentWillUnmount() {
    console.log("Counter removed from screen")
  }

  increment = () => {
    this.setState(prevState => ({ count: prevState.count + 1 }))
  }

  decrement = () => {
    this.setState(prevState => ({ count: prevState.count - 1 }))
  }

  reset = () => {
    this.setState({ count: 0 })
  }

  render() {
    const { count, message } = this.state
    return (
      <div>
        <h2>{message}</h2>
        <h1>Count: {count}</h1>
        <button onClick={this.increment}>+ Increment</button>
        <button onClick={this.decrement}>- Decrement</button>
        <button onClick={this.reset}>Reset</button>
      </div>
    )
  }
}

export default Counter
```

---

## Complete Working Example — API Fetch App

```jsx
import React, { Component } from 'react'

class UserList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      users: [],
      loading: true,
      error: null
    }
  }

  componentDidMount() {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => res.json())
      .then(users => this.setState({ users, loading: false }))
      .catch(error => this.setState({ error: error.message, loading: false }))
  }

  componentWillUnmount() {
    // cancel any pending requests here if using AbortController
    console.log("UserList unmounted — cleanup done")
  }

  render() {
    const { users, loading, error } = this.state

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}</p>

    return (
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} — {user.email}</li>
        ))}
      </ul>
    )
  }
}

export default UserList
```

---

## Error Boundary — Only Possible with Class Component

```jsx
class ErrorBoundary extends Component {

  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error("Error caught:", error)
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please refresh.</h2>
    }
    return this.props.children
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

## Class vs Functional — Side by Side

| Feature | Class Component | Functional Component |
|---|---|---|
| State | `this.state` + `this.setState()` | `useState()` |
| Props | `this.props` | Function parameter `props` |
| After mount | `componentDidMount()` | `useEffect(fn, [])` |
| After update | `componentDidUpdate()` | `useEffect(fn, [dep])` |
| Before unmount | `componentWillUnmount()` | `useEffect` cleanup |
| `this` keyword | Required everywhere | Not needed |
| Code style | Verbose | Clean & short |
| Modern? | ❌ Legacy | ✅ Yes |

---

## Common Interview Questions

**Q: What is a class component?**
> A class that extends React.Component with a mandatory render() method that returns JSX.

**Q: Why do we call super(props)?**
> To run the parent Component class constructor first — without it, this.props is undefined.

**Q: How do you update state?**
> Using this.setState() — never mutate this.state directly.

**Q: What is componentDidMount used for?**
> API calls, subscriptions, DOM manipulation — runs once after first render.

**Q: Are class components still used?**
> Yes — mainly in legacy codebases and for Error Boundaries, which cannot be done with hooks.

---

## One-Liner Summary

> *"Class components extend React.Component, manage state via this.state and this.setState(), and handle side effects through lifecycle methods like componentDidMount, componentDidUpdate, and componentWillUnmount. Since React 16.8, functional components with hooks replaced them — but class components are still used for Error Boundaries and legacy codebases."*