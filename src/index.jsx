import ReactDOM from "react-dom/client";
import React from "react";
import { HostContext } from "./components/useHostContext/useHostContext";
import { Scene, Box, Light } from "./components/Scene";
import { Model } from "./components/Model";
import { Layer } from "./components/Layer";
import { XR } from '@react-three/xr';

import { createTestWebComponent } from "./classes/ComponentTest";


const MainComponent = createTestWebComponent({},{onUpdate:({root,children, instanceID}) => { 
    !root.shadowRoot && (root.attachShadow({ mode: "open" }),root.reactRoot = ReactDOM.createRoot(root.shadowRoot)); 
    root.reactRoot.render(<ul key={instanceID}>{children}</ul>)
}})


customElements.define("mc-main-component", MainComponent);

const ChildComponent = createTestWebComponent({name:""},{onUpdate:({name,instanceID,children}) => <li key={instanceID}>{name}{ children && <ul>{children}</ul> }</li>})
customElements.define("mc-test-component", ChildComponent);


const SceneComponent = createTestWebComponent(
    {
    },
    { 
        onUpdate: ({root,children,instanceID}) => {
            !root.shadowRoot && (root.attachShadow({ mode: "open" }),root.reactRoot = ReactDOM.createRoot(root.shadowRoot));
            root.reactRoot.render(<Scene key={instanceID}>{children}</Scene>)
        } 
    })
customElements.define("mc-scene", SceneComponent);


const BoxComponent = createTestWebComponent(
    {
        "position":[0,0,0],
        "rotation":[0,0,0],
        "scale":1
    },
    {
        onUpdate: ({instanceID,position,rotation,scale}) => {
            console.log(instanceID,scale)
        return <Box 
                        key={instanceID} 
                        position={Object.assign([0, 0, 0], String(position).split(",").map(Number))} 
                        {...{rotation: rotation ? String(rotation).split(",").map(Number) : [0, 0, 0]}}
                        scale={Number(scale) || 1}
                    />}
    })
customElements.define("mc-box", BoxComponent);

const ModelComponent = createTestWebComponent(
    {
        "src":"",
        "position":"[0,0,0]",
        "rotation":"[0,0,0]",
        "scale":"[1,1,1]"
    },
    {
        onMount: (host) => { host.tabIndex = 0; host.addEventListener('focus', ()=> alert("fokus!")) },
        onUpdate: ({instanceID,src,position,rotation,scale,children}) => 
        {
            return src ? <Model key={"model_"+instanceID} 
                                src={src}
                                position={String(position).split(",").map(Number)} 
                                rotation={String(rotation).split(",").map(Number)}
                                scale={String(scale).split(",").map(Number)}
                            >{children}</Model>: null
        }
    })
customElements.define("mc-model", ModelComponent);

const LightComponent = createTestWebComponent(
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
                    position={String(position).split(",").map(Number)}
                />
            );
        }
    }
);
customElements.define("mc-light", LightComponent);

const XRComponent = createTestWebComponent(
    {
    },
    {
        onUpdate: ({ instanceID, children }) => {
            return (
                <XR key={instanceID}>{children}</XR>
            );
        }
    }
);
customElements.define("mc-xr", XRComponent);

const LayerComponent = createTestWebComponent(  
    {
        "opacity": 1,
        "visible": true,
        "layernumber": 0  },
    {
        onUpdate: ({ instanceID, children=[], opacity, visible }) => {
            console.log("layer", instanceID, visible, children);
            return <Layer visible={true} key={instanceID} opacity={1}></Layer>
        }
    }
);

customElements.define("mc-layer", LayerComponent);