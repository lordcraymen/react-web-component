import ReactDOM from "react-dom/client";
import React from "react";
import { createWebComponent } from "./classes/ComponenBase";
//import { Scene } from "./components/Scene";

const onParentMount = (host) => {   
    host.attachShadow({ mode: "open" });
    host.root = ReactDOM.createRoot(host.shadowRoot);
}

const onParentUpdate = (host,children) => {
    console.log("onParentUpdate")
    host.root.render(React.createElement("h1",{},children))
}
const ParentComponent = createWebComponent({username:"Username", "should-display-mentions": false, "test": ""}, { onMount: onParentMount, onUpdate: onParentUpdate })
customElements.define("my-web-component", ParentComponent);


const onUpdate = (host) => React.createElement("div",{},host.src)

const ChildComponent = createWebComponent({src:"",type:"test"},{onUpdate: onUpdate})
customElements.define("my-child-component", ChildComponent);