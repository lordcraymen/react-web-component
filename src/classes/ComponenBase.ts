const eventProperties = {  bubbles: true, composed: true, cancelable: true };

const subscriptionEvent = new Event('ComponentBase:Subscribe', eventProperties);
const updateEvent = new Event('ComponentBase:Update', eventProperties);
const unSubscribtionEvent = new Event('ComponentBase:Unsubscribe', eventProperties);


class ComponentBase extends HTMLElement {   
    private subscribers = new WeakMap<ComponentBase,any>();
    private state = new Map<string, any>();

    constructor(private attributeChangeHandler?: (name: string, newValue: any) => void) {
        super();
        this.addEventListener(subscriptionEvent.type, this.handleSubscribe);
        this.addEventListener('ComponentBase:Update', this.handleUpdate);
        this.addEventListener(unSubscribtionEvent.type, this.handleUnSubscribe);

    }

    public getSubscribers = () => this.subscribers;

    private handleSubscribe = (e) => {
        console.log(e.target, "is subscribing to updates")
        if (e.target instanceof ComponentBase) {
            e.stopPropagation();
            this.subscribers.set(e.target,e.detail);
        }
    }

    private handleUpdate = (e) => {
        console.log(e.target, "is sending an update")
        if (e.target instanceof ComponentBase) {
            e.stopPropagation();
            this.subscribers.set(e.target,e.detail);
        }
    }

    private handleUnSubscribe = (e) => { e.stopPropagation(); this.subscribers.delete(e.target); }

    protected connectedCallback() {
        this.dispatchEvent(subscriptionEvent);
    }

    protected attributeChangedCallback(name: string, previousValue: any, newValue: any) {
        if (previousValue !== newValue) {
            this.attributeChangeHandler && this.attributeChangeHandler(name, newValue)
            this.onAttributeChange(name, newValue)
        }
    }

    protected disconnectedCallback() {
        this.dispatchEvent(unSubscribtionEvent);
        this.removeEventListener(subscriptionEvent.type, this.handleSubscribe);
        this.removeEventListener(unSubscribtionEvent.type, this.handleUnSubscribe);
    }
    
    onAttributeChange(name: any, newValue: any) {
        this.state.set(name, newValue);
        console.log("attributeChanged!",this.state)
        this.dispatchEvent(subscriptionEvent);
        this.dispatchEvent(new CustomEvent('ComponentBase:Update', { detail: this.state , ...eventProperties }))
    }

}

const createWebComponent = (_interface = {}) =>{
    return class extends ComponentBase {
        static get observedAttributes() {
            return Object.keys(_interface);
        }

        constructor() {
            super();
            for (let key in _interface) {
                this[key] = _interface[key];
            }
        }
    };
}

export { createWebComponent, ComponentBase };