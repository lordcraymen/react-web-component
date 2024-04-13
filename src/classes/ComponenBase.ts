const eventProperties = {  bubbles: true, composed: true, cancelable: true };

const UPDATE_EVENT = 'ComponentBase:Update'


class ComponentBase extends HTMLElement {   
    private root;
    private subscribers = new WeakMap<ComponentBase,any>();
    private state = new Map<string, any>();
    private isDirty = false;

    
    constructor() {
        super();
        //this.attachShadow({ mode: "open" });
        this.addEventListener(UPDATE_EVENT, this.handleUpdate);
    }
    


    public getSubscribers = () => this.subscribers;

    static observedAttributes = () => {
        return [];
    }

    private getState = () => {
        const observedAttributes = ComponentBase.observedAttributes();
        const state = {};
        for (const attr of observedAttributes) {
            state[attr] = this.getAttribute(attr);
        }
        this.isDirty = false;
        return state;
    }

    private handleUpdate = (e) => {
        console.log(e.target, "is receiving an update")
        if (e.target instanceof ComponentBase) {
            e.stopPropagation();
            this.subscribers.set(e.target,e.detail);
            !this.isDirty && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: this.getState, ...eventProperties }))
        }
    }

    protected connectedCallback() {
        !this.isDirty && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: this.getState, ...eventProperties }))
    }

    protected attributeChangedCallback(name: string, previousValue: unknown, newValue: unknown) {
        if (previousValue !== newValue) {
            if(!this.isDirty) this.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: this.getState, ...eventProperties }))
            this.isDirty = true;
            this.onAttributeChange(name, newValue);
        }
    }

    protected disconnectedCallback() {
        this.dispatchEvent(new Event(UPDATE_EVENT));
        this.removeEventListener(UPDATE_EVENT, this.handleUpdate);
    }
    
    onAttributeChange(name: string, newValue: unknown) {}

}

interface ComponentInterface {
    [key: string]: any;
}

const createWebComponent = (_interface: ComponentInterface) => {
    return class extends ComponentBase {
        static observedAttributes() {
            return Object.keys(_interface);
        }

        constructor() {
            super();
            Object.assign(this, _interface);
        }
    }
}

export { createWebComponent, ComponentBase };