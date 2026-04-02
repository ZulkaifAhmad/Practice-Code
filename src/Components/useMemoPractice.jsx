import React, { useMemo  , useState } from "react";

const products = [
    { id: 1, name: "Apple", price: 1 },
    { id: 2, name: "Banana", price: 0.5 },
    { id: 3, name: "Mango", price: 1.5 },
    { id: 4, name: "Orange", price: 0.8 },
    { id: 5, name: "Grapes", price: 2 },
    { id: 6, name: "Pineapple", price: 3 },
  ];

function UseMemoPractice() {
  let [search, setSearch] = React.useState("");
  let [count, setCount] = React.useState(0);        
  
  
  let filtering = useMemo(()=> {
    console.log("Filtering products..."); 
    return products.filter((product)=> {
      return product.name.toLocaleLowerCase().includes(search.toLocaleLowerCase());
    });
  }, [search, products]);
  
  return (
    <div>
      <h2>useMemo Practice</h2>

      <input
        type="text"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        placeholder="Search products..."
        name="search"
        id="search"
      />
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      {
        filtering.length > 0 ? (
          <ul>
            {filtering.map((product) => (
              <li key={product.id}>
                {product.name} - ${product.price.toFixed(2)}
              </li>
            ))} 
          </ul>
        ) : (
          <p>No Search Results...</p>
        )
      }
    </div>
  );
}

export default UseMemoPractice;