import React, { Component } from "react";

class Counter extends Component {
    constructor(props){
        super(props);
        this.state = {
            count : 0
        }
    }
    increment = () =>{
        this.setState((prev)=>{
            return {
                count : prev.count + 1
            }
        });
        this.setState((prev)=>({
            count : prev.count + 1
        }));
    }
  render() {
    return <div>
        <h1>Counter App using Class Component</h1>
        <p>State : {this.state.count}</p>
        <button onClick={()=>this.increment()}>Click</button>
    </div>;
  }
}

export default Counter