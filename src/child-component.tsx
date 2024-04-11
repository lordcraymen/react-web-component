import { ComponentBase } from "./classes/ComponenBase";

class ChildComponent extends ComponentBase {
    onAttributeChange = (name,value) => {
        console.log(name,value);
    }

    static get observedAttributes() {
        return ["src"] // Example attributes
    }
}

export { ChildComponent }