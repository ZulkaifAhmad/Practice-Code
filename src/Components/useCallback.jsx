import React, { useCallback, useState } from "react";

function UseCallback() {
  const [count, setCount] = useState(0);
  const [theam, setTheam] = useState("light");

  const handleChangeTheam = useCallback(() => {
    console.log("Theam Changed", theam);
    setTheam((prev) => (prev === "light" ? "dark" : "light"));
  }, [theam]);

  const handleClick = useCallback(() => {
    console.log("handleClick Runs");
    return setCount((previous) => previous + 1);
  }, []);

  return (
    <div>
      <h1>UseCallback</h1>
      <button onClick={handleChangeTheam}>Change Theam</button>
      <Button handleClick={handleClick} count={count} />
    </div>
  );
}

export default UseCallback;

const Button = React.memo((props) => {
  console.log("Child Component Renders");
  return <button onClick={props.handleClick}>Click Me {props.count}</button>;
});
