const eventProperties = {  bubbles: true, composed: true, cancelable: true };

const UPDATE_EVENT = 'ComponentBase:Update'


class ComponentBase extends HTMLElement {   
    
    private componentInterface;
    private handlers;
    private subscribers = new Map<ComponentBase,any>();
    private isDirty = false;

    
    constructor(componentInterface = {},handlers = {}) {
        super();
        this.componentInterface = componentInterface;
        this.handlers = handlers;
        for (let key in componentInterface) {
            this[key] = componentInterface[key];
        }
        this.addEventListener(UPDATE_EVENT, this.handleUpdate);
    }
    
    public getSubscribers = () => Array.from(this.subscribers.values()).map(child => child.getState());

    static get observedAttributes() {
        return [];
    }

    private state = null;
    private getState = () => {
        if (this.isDirty) {
                if(this.handlers.onUpdate) {
                    this.state = Array.from(this.subscribers.values()).map(child => child.getState());
                } else {
                    this.state = {};
                for (const attr of Object.keys(this.componentInterface)) {
                    this.state[attr] = this.getAttribute(attr);
                }
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
            this.handlers.onUpdate(this,this.getState())
            this.isDirty = true;
        }
        
    }

    private cleanup = () => {}
    protected connectedCallback() {
        this.cleanup = this.handlers.onMount?.(this)
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

function createWebComponent(config,handlers) {
    return class extends ComponentBase {
        constructor() {
            super(config,handlers)
        }

        static get observedAttributes() {
            return Object.keys(config) || [];
        }
    };
}

export { createWebComponent, ComponentBase };