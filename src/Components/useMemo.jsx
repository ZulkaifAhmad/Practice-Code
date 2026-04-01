import React, { useState, useMemo } from 'react'

function UseMemo() {

  const [count, setCount] = useState(0)
  const [name, setName] = useState("")

  const double = useMemo(() => {
    console.log("calculating double...")
    return count * 2
  }, [count])

  const [search, setSearch] = useState("")

  const products = ["Apple", "Banana", "Mango", "Orange", "Grapes", "Pineapple"]

  const filtered = useMemo(() => {
    console.log("filtering...")
    return products.filter(p => p.toLowerCase().includes(search.toLowerCase()))
  }, [search])

  const [theme, setTheme] = useState("light")

  const config = useMemo(() => {
    return { theme: theme, language: "en" }
  }, [theme])

  return (
    <div>

      <h3>Case 1: Expensive Calculation</h3>
      <p>Count: {count}</p>
      <p>Double: {double}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment Count</button>
      <br />
      <input
        placeholder="type here (won't recalculate double)"
        onChange={(e) => setName(e.target.value)}
      />
      <p>Name: {name}</p>

      <hr />

      <h3>Case 2: Filter List</h3>
      <input
        placeholder="Search product..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {filtered.map((p, i) => <li key={i}>{p}</li>)}
      </ul>

      <hr />

      <h3>Case 3: Stable Object Reference</h3>
      <p>Config: {JSON.stringify(config)}</p>
      <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>

    </div>
  )
}

export default UseMemo