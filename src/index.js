import { SubscriptionWebComponent }  from "./web-component";
customElements.define("my-web-component", SubscriptionWebComponent );

import { createWebComponent } from "./classes/ComponenBase";
const ChildComponent = createWebComponent({src:"", onAttributeChange: (name,value) => { console.log(name,value)}})
customElements.define("my-child-component", ChildComponent);