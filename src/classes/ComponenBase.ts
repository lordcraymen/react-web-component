const eventProperties = {  bubbles: true, composed: true, cancelable: true };

const UPDATE_EVENT = 'ComponentBase:Update'


class ComponentBase extends HTMLElement {   
    
    private componentInterface;
    private handlers;
    private subscribers = new Map<ComponentBase,any>();
    private isDirty = false;
    private onGetState = (state) => state

    
    constructor(componentInterface = {},handlers) {
        super();
        this.componentInterface = componentInterface;
        this.handlers = handlers;
        for (let key in componentInterface) {
            this[key] = componentInterface[key];
        }
        this.onGetState = handlers.onGetState || this.onGetState;
        this.addEventListener(UPDATE_EVENT, this.handleUpdate);
    }
    
    public getSubscribers = () => Array.from(this.subscribers.values()).map(child => child.getState());

    static get observedAttributes() {
        return [];
    }

    private state = null;
    private props = {};
    private getState = () => {
        if (this.isDirty) {
                for (const attr of Object.keys(this.componentInterface)) {
                    this.props[attr] = this.getAttribute(attr);
                }
                this.state = this.onGetState({ ...this.props, children:this.getSubscribers() || [] });
            this.isDirty = false;
        }
        return this.state;
    }

    private handleUpdate = (e) => {
       if (e.target instanceof ComponentBase && this !== e.target) {
            e.stopPropagation();
            this.subscribers.set(e.target,e.detail);
            //!this.isDirty && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { getState: this.getState }, ...eventProperties }))
            this.handlers.onUpdate({...this.getState(),root: this.root})
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
            this.handlers.onUpdate?.({...this.getState(), root: this.root})
        }
        
    }
    
    protected disconnectedCallback() {
        this.dispatchEvent(new Event(UPDATE_EVENT));
        this.removeEventListener(UPDATE_EVENT, this.handleUpdate);
        this.cleanup();
        this.subscribers.clear();
    }
   
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