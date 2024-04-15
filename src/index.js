import { createWebComponent } from "./classes/ComponenBase";

const ParentComponent = createWebComponent({username:"Username", "should-display-mentions": false, "test": ""})
customElements.define("my-web-component", ParentComponent);

const ChildComponent = createWebComponent({src:"",type:"test"})
customElements.define("my-child-component", ChildComponent);