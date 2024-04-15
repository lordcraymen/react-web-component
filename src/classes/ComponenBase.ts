const eventProperties = {  bubbles: true, composed: true, cancelable: true };

const UPDATE_EVENT = 'ComponentBase:Update'


class ComponentBase extends HTMLElement {   
    
    private root;
    private config;
    private subscribers = new WeakMap<ComponentBase,any>();
    private isDirty = false;

    
    constructor(config) {
        super();
        this.config = config;
        for (let key in config) {
            this[key] = config[key];
        }
        this.addEventListener(UPDATE_EVENT, this.handleUpdate);
    }
    
    public getSubscribers = () => this.subscribers;

    static get observedAttributes() {
        return [];
    }

    private getState = () => {
        const state = {};
        for (const attr of Object.keys(this.config)) {
            state[attr] = this.getAttribute(attr);
        }
        this.isDirty = false;
        return state;
    }

    private handleUpdate = (e) => {
       if (e.target instanceof ComponentBase && this !== e.target) {
            e.stopPropagation();
            this.subscribers.set(e.target,e.detail);
            !this.isDirty && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { getState: this.getState }, ...eventProperties }))
            this.isDirty = true;
        }
    }

    protected connectedCallback() {
        !this.isDirty && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: { getState: this.getState }, ...eventProperties }))
        this.isDirty = true;
    }
 

    protected attributeChangedCallback(name: string, previousValue: unknown, newValue: unknown) {
        console.log(this.isDirty)
        if (previousValue !== newValue) {
            if(!this.isDirty) { 
                this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: { getState: this.getState }, ...eventProperties })) 
            }
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

function createWebComponent(config) {
    return class extends ComponentBase {
        constructor() {
            super(config)
        }

        static get observedAttributes() {
            return Object.keys(config) || [];
        }
    };
}

export { createWebComponent, ComponentBase };