import ReactDOM from "react-dom/client";
import React from "react"; // Make sure to import React
import App from "./App";
import { Store } from "./components/useHostContext/HostStateStore";
import { HostContext } from "./components/useHostContext/useHostContext";

const normalizeAttribute = (attribute) => attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

const normalizeAttributeToPropertyName = (attribute) => attribute.replace(/-([a-z])/g, (g) => g[1].toUpperCase())

const normalizePropertyNameToAttribute = (property) => property.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const exposeProperties = (target, props) => {
  props.forEach(prop => {
    const attr = normalizePropertyNameToAttribute(prop);
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

class SubscriptionWebComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.root = ReactDOM.createRoot(this.shadowRoot); // Store the root for later updates
    this.hostState = new Store()
    exposeProperties(this, SubscriptionWebComponent.observedAttributes.map(normalizeAttributeToPropertyName));
  }

  static get observedAttributes() {
    return ["username", "should-display-mentions", "test"] // Example attributes
  }

  connectedCallback() {
    this.updateReactComponent()
  }

  attributeChangedCallback(name, _, newValue) {
    console.log(name, newValue)
    //if (HostState.getState(name) !== newValue) {
      this.hostState.setState(name, newValue)
    //}
  }

  updateReactComponent() {
    // Get props from attributes every time an update is needed
    const props = this.getPropsFromAttributes()
    this.root.render(<HostContext.Provider value={this.hostState}><App /></HostContext.Provider>)
  }

  getPropsFromAttributes() {
    const props = {};

    for (let index = 0; index < this.attributes.length; index++) {
      const attribute = this.attributes[index]
      props[normalizeAttribute(attribute.name)] = attribute.value
    }

    return props
  }
}

export default SubscriptionWebComponent
