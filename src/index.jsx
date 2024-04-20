import ReactDOM from "react-dom/client";
import React from "react";
import { createWebComponent } from "./classes/ComponenBase";
import { HostContext } from "./components/useHostContext/useHostContext";
import { Scene, Box, Model } from "./components/Scene";

const SceneComponent = createWebComponent(
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
customElements.define("mc-scene", SceneComponent);


const BoxComponent = createWebComponent(
    {
        "position":[0,0,0],
        "rotation":[0,0,0],
        "scale":[1,1,1]
    },
    {
        onUpdate: ({instanceID,position,rotation,scale}) => 
        {
            return <Box key={instanceID} 
                        position={String(position).split(",")} 
                        rotation={String(rotation).split(",")}
                        scale={String(scale).split(",")}
                    />
        }
    })
customElements.define("mc-box", BoxComponent);

const ModelComponent = createWebComponent(
    {
        "src":"",
        "position":[0,0,0],
        "rotation":[0,0,0],
        "scale":[1,1,1]
    },
    {
        onUpdate: ({instanceID,src,position,rotation,scale}) => 
        {
            return src && <Model key={instanceID} 
                        src={src}
                        position={String(position).split(",")} 
                        rotation={String(rotation).split(",")}
                        scale={String(scale).split(",")}
                    />
        }
    })
customElements.define("mc-model", ModelComponent);