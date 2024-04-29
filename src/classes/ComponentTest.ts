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
    private _state: { [propname: string]: unknown };

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

        this.addEventListener(NOTIFICATION_EVENT, this.handleEvent);
        
    }

    private handleEvent = (e) => {
        if (e.target !== this && e.target instanceof ComponentTest) {
            e.stopPropagation();
            const actions = {
                'update': () => {
                    this._subscribers.set(e.target, e.detail.newState);
                    console.log(this.getAttribute("name"),"received", e.detail,"from", e.target.getAttribute("name"));
                },
                'unsubscribe': () => {
                    this._subscribers.delete(e.target);
                }
            }
            actions[e.detail.action]?.();
            this.sendAction("update");
        }
    }

    private sendAction = (action) => {
        if (this._parent) {
            //const children = getOrderedChildrenState(this._subscribers);
            //const newState = this._handlers.onUpdate?.({...this._state,children}) || {...this._state, children};
            sendUpdate(this, { action, newState: {...this._state, children: {...this._subscribers.values()}} } );
        }
    }

    connectedCallback() {
        this._parent = this.parentElement;
        console.log(this.getAttribute("name"),"is the child of", this._parent.getAttribute("name"));
        this.sendAction("update");  
    }

    attributeChangedCallback(name: string, oldValue:string, newValue: string) {
        if (this._state[name] !== newValue) {
            this._state[name] = newValue
            this.sendAction("update");
        }
    }

    disconnectedCallback() {
        console.log(`${this._state.name} has been disconnected`);
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