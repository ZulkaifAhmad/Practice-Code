import React, { Component } from 'react'

export default class ClassComp extends Component {
    constructor(props){
        super(props);
        console.log(this.props);
        this.state = {
            name: "Zulkaif",
            age : 20
        };
    }
    componentDidMount(){ // this will run only for the first render
        console.log("Component Did Mount for firt render");
    }
    componentDidUpdate(){ // this will run for every update
        console.log("Component Did Update for every update");   
    }
    componentWillUnmount(){ // this will run for every unmount
        console.log("Component Will Unmount for every unmount");
    }
  render() {
    return (
      <div>This is my First class based component {this.state.name}, Age: {this.state.age}</div>
    )
  }
}
