import { send } from "vite";

const eventProperties = { bubbles: true, composed: true, cancelable: true };
const NOTIFICATION_EVENT = 'ComponentTest:Notification'
const sendUpdate = (sender, payload) => sender && sender.dispatchEvent && sender.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: payload, ...eventProperties }));

const getUniqueID = (length = 7) => Math.random().toString(36).substring(length);

const getOrderedChildrenState = (children: Map<HTMLElement, unknown>) => Array.from(children.keys())
    .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
    .map(key => children.get(key));

class ComponentTest extends HTMLElement {
    protected _properties: { [propname: string]: unknown };
    protected _parent: HTMLElement;
    protected _subscribers: Map<HTMLElement, unknown>;
    protected _instanceID: string;
    protected _handlers: { [handler: string]: Function };
    protected _state: { [propname: string]: unknown };

    static get observedAttributes() {
        return [];
    }

    constructor(properties = {}, handlers = {}) {
        super();
        
        this._instanceID = getUniqueID();
        this._handlers = handlers;
        this._properties = properties;
         
        Object.entries(properties).forEach(([key, value]) => this[key] = value);

        this._state = {};
        this._subscribers = new Map();
        
    }


    private handleEvent = (e) => {
        const { sender, action, newState } = e.detail;

        console.log(sender,sender instanceof ComponentTest)

        if(this._subscribers.has(sender) && action === "unsubscribe") {
            e.stopPropagation();
            this._subscribers.delete(sender);
            this.sendAction("update");
        } else
        if (sender !== this && sender instanceof ComponentTest) {
            e.stopPropagation();
            this._subscribers.set(sender, newState);
            this.sendAction("update");
        }
    }

    private sendAction = (action) => {
        if (this._parent) {
            const orderedChildrenState = getOrderedChildrenState(this._subscribers);
            const tempState = {...this._state, root:this, instanceID: this._instanceID, children: orderedChildrenState}
            const newState = this._handlers.onUpdate?.(tempState) || tempState;
            sendUpdate(this._parent, { sender: this, action, newState} );
        }
    }

    connectedCallback() {
        this.addEventListener(NOTIFICATION_EVENT, this.handleEvent);
        this._parent = this.parentElement;
        this.sendAction("update");  
    }

    attributeChangedCallback(name: string, oldValue:string, newValue: string) {
        this._state[name] !== newValue ? (this._state[name] = newValue, this.sendAction("update")) : null;
    }

    disconnectedCallback() {
        this.removeEventListener(NOTIFICATION_EVENT, this.handleEvent);
        this.sendAction("unsubscribe");
        this._subscribers.clear();
    }


}

function createTestWebComponent(properties, handlers) {
    return class extends ComponentTest {
        constructor() {
            super(properties, handlers)
        }

        static get observedAttributes() {
            return Object.keys(properties) || [];
        }
    };
}

export { ComponentTest, createTestWebComponent };