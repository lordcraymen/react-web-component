const eventProperties = {  bubbles: true, composed: true, cancelable: true };

const UPDATE_EVENT = 'ComponentBase:Update'


class ComponentBase extends HTMLElement {   
    
    private key;
    private componentInterface;
    private handlers;
    private subscribers = new Map<ComponentBase,any>();
    private cleanup = () => {};

    static observedAttributes = [];
    
    constructor(componentInterface = {},handlers) {
        super();
        this.key = Math.random().toString(36).substring(7);
        this.componentInterface = componentInterface;
        this.handlers = handlers;
        for (let key in componentInterface) {
            this[key] = componentInterface[key];
        }
        this.addEventListener(UPDATE_EVENT, this.handleChildUpdate);
    }
    
    protected getSubscribedChildren = () => Array.from(this.subscribers.values())

    protected getProps = () => { 
        const props = Object.keys(this.componentInterface).reduce((state, key) => (state[key] = this[key],state), {})
        props["key"] = this.key
        props["children"] = this.getSubscribedChildren()
        this["root"] && (props["root"] = this["root"])
        return props
    }

    private handleChildUpdate = (e) => {
       if (e.target instanceof ComponentBase && this !== e.target) {
            e.stopPropagation();
            this.subscribers.set(e.target,e.detail);
            const update = this.handlers.onUpdate?.(this.getProps())
            update && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: update, ...eventProperties }))
        }  
    }

    protected connectedCallback() {
        this.cleanup = this.handlers.onMount?.(this)
        const update = this.handlers.onUpdate?.(this.getProps())
        update && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: update, ...eventProperties }))
    }
 
    protected attributeChangedCallback(name: string, previousValue: unknown, newValue: unknown) {
        if (previousValue !== newValue) {
                const update = this.handlers.onUpdate?.(this.getProps())
                update && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: update, ...eventProperties })) 
            }
    }
    
    protected disconnectedCallback() {
        this.dispatchEvent(new Event(UPDATE_EVENT));
        this.removeEventListener(UPDATE_EVENT, this.handleChildUpdate);
        this.subscribers.clear();
        this.cleanup();
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