import ReactDOM from "react-dom/client";
import React from "react";
import { createWebComponent } from "./classes/ComponenBase";
import { HostContext } from "./components/useHostContext/useHostContext";
import { Scene, Box } from "./components/Scene";

const ParentComponent = createWebComponent(
    {
        "username":"Username",
        "should-display-mentions": false, 
        "test": ""
    },
    { 
        onMount: (host) => {   
            host.attachShadow({ mode: "open" });
            host.root = ReactDOM.createRoot(host.shadowRoot);
        }, 
        onUpdate: ({root,children,instanceID}) => {
            root?.render(<Scene key={instanceID}>{...children}</Scene>)
        } 
    })
customElements.define("my-web-component", ParentComponent);


const ChildComponent = createWebComponent(
    {
        "src":"src",
        "type":"test"
    },
    {
        onUpdate: ({type,src,instanceID}) => <Box key={instanceID} />
    })
customElements.define("my-child-component", ChildComponent);