import ReactDOM from "react-dom/client";
import React from "react";
import { createWebComponent } from "./classes/ComponenBase";
import { Scene } from "./components/Scene";

const onParentMount = (host) => {   
    host.attachShadow({ mode: "open" });
    const root = ReactDOM.createRoot(host.shadowRoot);
    root.render(<Scene />)
}
const ParentComponent = createWebComponent({username:"Username", "should-display-mentions": false, "test": "", onMount: onParentMount })
customElements.define("my-web-component", ParentComponent);

const ChildComponent = createWebComponent({src:"",type:"test"})
customElements.define("my-child-component", ChildComponent);