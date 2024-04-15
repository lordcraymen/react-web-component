const eventProperties = {  bubbles: true, composed: true, cancelable: true };

const UPDATE_EVENT = 'ComponentBase:Update'


class ComponentBase extends HTMLElement {   
    
    private config;
    private subscribers = new Map<ComponentBase,any>();
    private isDirty = false;

    
    constructor(config = {}) {
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

    private state = {};
    private getState = () => {
        if (this.isDirty) {
            this.state = {};
            for (const attr of Object.keys(this.config)) {
                this.state[attr] = this.getAttribute(attr);
            }
            this.isDirty = false;
        }
        return this.state;
    }

    private handleUpdate = (e) => {
       if (e.target instanceof ComponentBase && this !== e.target) {
            e.stopPropagation();
            this.subscribers.set(e.target,e.detail);
            !this.isDirty && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { getState: this.getState }, ...eventProperties }))
            this.isDirty = true;
        }
        
    }

    private cleanup = () => {}
    protected connectedCallback() {
        this.cleanup = this.config.onMount?.(this)
        !this.isDirty && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: { getState: this.getState }, ...eventProperties }))
        this.isDirty = true;
    }
 

    protected attributeChangedCallback(name: string, previousValue: unknown, newValue: unknown) {
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
        this.cleanup();
        this.subscribers.clear();
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