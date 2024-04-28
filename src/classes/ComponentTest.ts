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
        this._state = this._properties = properties;
        
        this._subscribers = new Map();
        console.log(`${this._properties.id} has been created`);
        this.addEventListener(NOTIFICATION_EVENT, this.handleEvent);
    }

    private handleEvent = (e) => {
        if (e.detail.sender !== this && e.detail.sender instanceof ComponentTest) {
            e.stopPropagation();
            const actions = {
                'update': () => {
                    this._subscribers.set(e.detail.sender, e.detail.newState);
                    console.log(e.detail.sender, 'updated', this._state.name, this._subscribers);
                },
                'unsubscribe': () => {
                    this._subscribers.delete(e.detail.sender);
                    console.log(e.detail.sender, 'unsubscribed from', this._state.name, this._subscribers);
                }
            }
            actions[e.detail.action]?.();
        }
    }

    protected sendAction = (action) => {
        if (!this._parent) this._parent = this.parentElement;
        if (this._parent) {
            this._state = this._handlers.onUpdate?.({ ...this._state, children: getOrderedChildrenState(this._subscribers) }) || {};
            sendUpdate(this._parent, { action, sender: this, newState: { ...this._state } });
        }
    }

    connectedCallback() {
        console.log(`${this._state.name} has been connected`);
        this.sendAction("update");
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (this._state[name] !== newValue) {
            this._state[name] = newValue
            console.log(`${this._state.name} ID has been changed from ${oldValue} to ${newValue}`);
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