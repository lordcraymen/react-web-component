import ReactDOM from "react-dom/client";
import React from "react";
import { createWebComponent } from "./classes/ComponenBase";
import { HostContext } from "./components/useHostContext/useHostContext";
import { Scene, Box, Light } from "./components/Scene";
import { Model } from "./components/Model";
import { Layer } from "./components/Layer";
import { XR } from '@react-three/xr';

import { createTestWebComponent } from "./classes/ComponentTest";

const GrandfatherComponent = createTestWebComponent({name:"Grandfather"})
customElements.define("mc-grandfather", GrandfatherComponent);

const FatherComponent = createTestWebComponent({name:"Father"})   
customElements.define("mc-father", FatherComponent);

const ChildComponent = createTestWebComponent({name:"Child"})
customElements.define("mc-child", ChildComponent);


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
            console.log("SceneComponent onUpdate", children)
            root?.render(<Scene key={instanceID}>{children}</Scene>)
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
        onMount: (host) => { host.tabIndex = 0; host.addEventListener('focus', ()=> alert("fokus!")) },
        onUpdate: ({instanceID,src,position,rotation,scale}) => 
        {
            return src ? <Model key={"model_"+instanceID} 
                        src={src}
                        position={String(position).split(",")} 
                        rotation={String(rotation).split(",")}
                        scale={String(scale).split(",")}
                    />: null
        }
    })
customElements.define("mc-model", ModelComponent);

const LightComponent = createWebComponent(
    {
        "type":"ambient",
        "color": "#ffffff",
        "intensity": 1,
        "position": [0, 0, 0]
    },
    {
        onUpdate: ({ instanceID, color, type, intensity, position }) => {
            return (
                <Light
                    type={type}
                    key={instanceID}
                    color={color}
                    intensity={intensity}
                    position={String(position).split(",")}
                />
            );
        }
    }
);
customElements.define("mc-light", LightComponent);

const XRComponent = createWebComponent(
    {
    },
    {
        onUpdate: ({ instanceID, color, type, intensity, position }) => {
            return (
                <XR>{children}</XR>
            );
        }
    }
);
customElements.define("mc-xr", XRComponent);

const LayerComponent = createWebComponent(  
    {
        "opacity": 1,
        "visible": true,
        "layernumber": 0  },
    {
        onUpdate: ({ instanceID, children, opacity, visible, layernumber }) => {
            return (
                visible ? <Layer key={"Layer"+layernumber}>{children}</Layer> : null
            );
        }
    }
);

customElements.define("mc-layer", LayerComponent);