import ReactDOM from "react-dom/client";
import React from "react";
import { HostContext } from "./components/useHostContext/useHostContext";
import { Scene, Box, Light, Group } from "./components/Scene";
import { POI } from "./components/POI";
import { Model } from "./components/Model";
import { Layer } from "./components/Layer";
import { XR } from '@react-three/xr';
import { Rotator } from "./components/Rotator";

import { createTestWebComponent } from "./classes/ComponentTest";

const componentStore = new Map()
const defineCustomElement = (tagName, component) => {
    Array.from(document.getElementsByTagName(tagName)).forEach(el => { componentStore.set(el, { parent: el.parentElement, sibling: el.nextSibling }); el.remove() });
    customElements.define(tagName, component);
}
document.addEventListener("DOMContentLoaded", () =>
    Array.from(componentStore).reverse().forEach(([key, value]) => value.parent.insertBefore(key, value.sibling))
);


const MainComponent = createTestWebComponent({}, {
    onUpdate: ({ root, children, instanceID }) => {
        !root.shadowRoot && (root.attachShadow({ mode: "open" }), root.reactRoot = ReactDOM.createRoot(root.shadowRoot));
        root.reactRoot.render(<ul key={instanceID}>{children}</ul>)
    }
})
defineCustomElement("mc-main-component", MainComponent);

const ChildComponent = createTestWebComponent({}, {
    onUpdate: ({instanceID}) => <group key={instanceID}/>
})
defineCustomElement("mc-test-component", ChildComponent);


const SceneComponent = createTestWebComponent(
    {
    },
    {
        onInit: (root) => {
            const container = document.createElement("div");
            container.style.width = "100%";
            container.style.height = "100%";
            container.addEventListener('focus', (e) => { e.stopPropagation(); e.preventDefault() })
            const shadow = container.attachShadow({ mode: "open" });
            root.reactRoot = ReactDOM.createRoot(shadow);
            root.appendChild(container);

        },
        onUpdate: ({ root, children, instanceID }) => {
            root.reactRoot.render(<Scene {...{ key: instanceID, children }} />)
        }
    })
defineCustomElement("mc-scene", SceneComponent);


const BoxComponent = createTestWebComponent(
    {
        "position": [0, 0, 0],
        "rotation": [0, 0, 0],
        "scale": 1,
        "focus": false
    },
    {
        onInit: (host) => {
            host.addEventListener('focus', () => { host.sendAction("update") })
            host.addEventListener('blur', () => { host.sendAction("update") })
        },
        onUpdate: ({ root, instanceID, position, rotation, scale, children }) =>
            <Box
                focus={document.activeElement === root}
                key={instanceID}
                position={Object.assign([0, 0, 0], String(position).split(",").map(Number))}
                {...{ rotation: rotation ? String(rotation).split(",").map(Number) : [0, 0, 0] }}
                scale={Number(scale) || 1}
            >{children}</Box>
    })


const ModelComponent = createTestWebComponent(
    {
        "src": "",
        "position": "[0,0,0]",
        "rotation": "[0,0,0]",
        "scale": "[1,1,1]"
    },
    {
        onInit: (host) => { host.tabIndex = 0; host.addEventListener('focus', () => alert("fokus!")) },
        onUpdate: ({ instanceID, src, position, rotation, scale, children }) => {
            return src ? <Model key={"model_" + instanceID}
                src={src}
                position={String(position).split(",").map(Number)}
                rotation={String(rotation).split(",").map(Number)}
                scale={String(scale).split(",").map(Number)}
            >{children}</Model> : null
        }
    })
defineCustomElement("mc-model", ModelComponent);

const LightComponent = createTestWebComponent(
    {
        "type": "ambient",
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
defineCustomElement("mc-light", LightComponent);

const XRComponent = createTestWebComponent(
    {
    },
    {
        onUpdate: ({ instanceID, children }) => <XR {...{ key: instanceID, children }} />
    }
);


defineCustomElement("mc-xr", XRComponent);

const LayerComponent = createTestWebComponent(
    {
        "opacity": 1.0,
        "visible": true,
    },
    {
        onUpdate: ({ instanceID, children, opacity, visible }) => <Layer {...{ key: instanceID, children, opacity, visible: !(visible === "false") }} />
    }
);

defineCustomElement("mc-layer", LayerComponent);

const GroupComponent = createTestWebComponent(
    {
        "position": [0, 0, 0],
        "rotation": [0, 0, 0],
        "scale": 1
    },
    {
        onUpdate: ({ instanceID, position, rotation, scale, children }) => {
            return <Group
                key={instanceID}
                position={Object.assign([0, 0, 0], String(position).split(",").map(Number))}
                {...{ rotation: rotation ? String(rotation).split(",").map(Number) : [0, 0, 0] }}
                scale={Number(scale) || 1}
            >{children}</Group>
        }
    })

    const POIComponent = createTestWebComponent(
        {
            "position": [0, 0, 0],
        },
        {
            onInit: (host) => {
                host.addEventListener('focus', () => { host.sendAction("update") })
                host.addEventListener('blur', () => { host.sendAction("update") })
            },
            onUpdate: ({ root, instanceID, position }) => {
                return <POI
                    key={instanceID}
                    position={Object.assign([0, 0, 0], String(position).split(",").map(Number))}
                    active = {document.activeElement === root}
                />
            }
        })

        const RotatorComponent = createTestWebComponent(
        {
            "active": true,
        },
        {
            onUpdate: ({ instanceID, active, children }) => {
                return <Rotator key={instanceID} active={active === "true" } >{children}</Rotator>
            }
        })

defineCustomElement("mc-rotator", RotatorComponent);
defineCustomElement("mc-poi", POIComponent);
defineCustomElement("mc-box", BoxComponent);
defineCustomElement("mc-group", GroupComponent);


