import ReactDOM from "react-dom/client";
import React from "react";
import { ComponentBase } from "./classes/ComponenBase";
import { App, ComponentInterface } from "./App";
import { Store } from "./components/useHostContext/HostStateStore";
import { HostContext } from "./components/useHostContext/useHostContext";

const kebabToCamel = (attribute) => attribute.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
const camelToKebab = (variableName) => variableName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const exposeProperties = (target, props) => {
  props.forEach(prop => {
    const attr = camelToKebab(prop);
    Object.defineProperty(target, prop, {
      get() {
        return this.getAttribute(attr);
      },
      set(value) {
        if (value !== null) {
          this.setAttribute(attr, value);
        } else {
          this.removeAttribute(attr);
        }
      },
      configurable: true,
      enumerable: true,
    });
  });
};
 

class SubscriptionWebComponent extends ComponentBase {
  //private root;
  private hostState;
  
  constructor() {
    super();
    //this.attachShadow({ mode: "open" });
    //this.root = ReactDOM.createRoot(this.shadowRoot); // Store the root for later updates
    ComponentInterface["host-element"] = this
    this.hostState = new Store(ComponentInterface)
    exposeProperties(this, SubscriptionWebComponent.observedAttributes.map(kebabToCamel));
  }

  static get observedAttributes() {
    return Object.keys(ComponentInterface) // Example attributes
  }

  connectedCallback() {
    this.updateReactComponent()
  }

  attributeChangedCallback(name, previousValue, newValue) {
      if(this.hostState.getState(name) !== previousValue) { this.hostState.setState(name, newValue) }
  }

  updateReactComponent() {
    // Get props from attributes every time an update is needed
    const props = this.getPropsFromAttributes()
    this.root?.render(<HostContext.Provider value={this.hostState}><App /></HostContext.Provider>)
  }

  getPropsFromAttributes() {
    const props = {};

    for (let index = 0; index < this.attributes.length; index++) {
      const attribute = this.attributes[index]
      props[camelToKebab(attribute.name)] = attribute.value
    }

    return props
  }
}

export { SubscriptionWebComponent }
