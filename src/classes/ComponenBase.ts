const eventProperties = {  bubbles: true, composed: true, cancelable: true };

const UPDATE_EVENT = 'ComponentBase:Update'
const UNSUBSCRIBE_EVENT = 'ComponentBase:Unsubscribe'


class ComponentBase extends HTMLElement {   
    
    private state;
    private key;
    private componentInterface;
    private handlers;
    private subscribers = new Map<ComponentBase,any>();
    private cleanup;

    static observedAttributes = [];
    
    constructor(componentInterface = {},handlers) {
        super();
        this.key = Math.random().toString(36).substring(7);
        this.componentInterface = componentInterface;
        this.handlers = handlers;
        this.cleanup = () => {};
        this.state = {};
        for (let key in componentInterface) {
            this[key] = componentInterface[key];
        }
        this.addEventListener(UPDATE_EVENT, this.handleChildUpdate);
        this.addEventListener(UNSUBSCRIBE_EVENT, this.handleUnsubscribe);
    }
    
    protected getSubscribedChildren = () => Array.from(this.subscribers.values())

    protected getProps = () => {
        const props = {
            ...Object.keys(this.componentInterface).reduce((state, key) => {
                state[key] = this.attributes.getNamedItem(key)?.value || this.componentInterface[key];
                return state;
            }, {}),
            key: this.key,
            children: this.getSubscribedChildren(),
            root: this["root"]
        };
        return props;
    }
    

    private handleChildUpdate = (e) => {
       if (e.target instanceof ComponentBase && this !== e.target) {
            e.stopPropagation();
            this.subscribers.set(e.target,e.detail);
            this.state = this.getProps()
            const update = this.handlers.onUpdate?.(this.state)
            update && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: update, ...eventProperties }))
        }  
    }

    private handleUnsubscribe = (e) => {
        if (e.detail.sender instanceof ComponentBase && this.subscribers.has(e.detail.sender)) {
            console.log("unsubscribing",e.detail.sender,"from",this,"with",this.subscribers.size,"subscribers")
            e.stopPropagation();
            this.subscribers.delete(e.detail.sender);
            this.state = this.getProps()
            const update = this.handlers.onUpdate?.(this.state)
            update && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: update, ...eventProperties }))
        }
    }
    

    protected connectedCallback() {
        this.cleanup = this.handlers.onMount?.(this)
        this.state = this.getProps()
        console.log(this.state)
        const update = this.handlers.onUpdate?.(this.state)
        update && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: update, ...eventProperties }))
    }
 
    
    protected attributeChangedCallback(name: string, previousValue: unknown, newValue: unknown) {
        if (this.state[name] !== newValue) {
            this.state[name] = newValue
                const update = this.handlers.onUpdate?.(this.state)
                update && this.dispatchEvent(new CustomEvent(UPDATE_EVENT, {  detail: update, ...eventProperties })) 
        }
    }
    
    
    protected disconnectedCallback() { // it seems that in this callback the node is already detached from the dom, and parentElement and parentNode are already null.... 
        //how can I tell the element this element is subscribed to, to remove it from the the parent subscriber map?
        console.log("unsubscribing",this, this.parentNode)
        this.removeEventListener(UPDATE_EVENT, this.handleChildUpdate);
        this.subscribers.clear();
        this.parentElement?.dispatchEvent(new CustomEvent(UNSUBSCRIBE_EVENT, {detail: {sender: this}, ...eventProperties}));
        //this.cleanup();
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