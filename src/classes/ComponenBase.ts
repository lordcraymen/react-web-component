const eventProperties = { bubbles: true, composed: true, cancelable: true };

const SUBSCRIBE_EVENT = 'ComponentBase:Subscribe'

class ComponentBase extends HTMLElement {

    private componentInterface;
    private handlers;

    private subscription;
    private subscribers = new Map<ComponentBase, any>();

    private state;
    private instanceID;

    static observedAttributes = [];

    constructor(componentInterface = {}, handlers) {
        super();
        this.instanceID = Math.random().toString(36).substring(7);

        this.componentInterface = componentInterface;
        Object.entries(componentInterface).forEach(([key, value]) => this[key] = value);

        this.handlers = handlers;
        this.state = {};

        this.addEventListener(SUBSCRIBE_EVENT, this.handleChildSubscription);
    }

    protected getSubscribedChildrenState = () => Array.from(this.subscribers.keys())
    .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
    .map(key => this.subscribers.get(key));

    protected getProps = () => {
        const props = {
            ...Object.keys(this.componentInterface).reduce((state, key) => {
                state[key] = this.attributes.getNamedItem(key)?.value || this.componentInterface[key];
                return state;
            }, {}),
            instanceID: this.instanceID,
            children: this.getSubscribedChildrenState(),
            root: this["root"]
        };
        return props;
    }

    private update = () => {
        const update = this.handlers.onUpdate?.(this.getProps())
        update && this.subscription?.update(update)
    }

    private handleChildSubscription = (e) => {
        console.log(e.target.instanceID, 'subscribing to', this.instanceID)
        if (e.target.parentNode === this) { 
            e.stopPropagation();
            console.log(e.target.instanceID, 'subscribed to', this.instanceID )
            this.subscribers.set(e.target, null);
            e.detail.setSubscriptionTo({
                update: (update) => { this.subscribers.set(e.target, update); this.update() },
                unsubscribe: () => { this.subscribers.delete(e.target); this.update() }
            })
        }
    }

    protected connectedCallback() {
        this.handlers.onMount?.(this)
        this.dispatchEvent(new CustomEvent(SUBSCRIBE_EVENT, {
            detail:
            {
                setSubscriptionTo: (sub) => this.subscription = sub
            }, ...eventProperties
        }))
        this.update()
    }


    protected attributeChangedCallback(name: string, previousValue: unknown, newValue: unknown) {
        if (this.state[name] !== newValue) {
            this.state[name] = newValue;
            this.update();
        }
    }


    protected disconnectedCallback() {
        this.removeEventListener(SUBSCRIBE_EVENT, this.handleChildSubscription);
        this.subscribers.clear();
        this.subscription && this.subscription.unsubscribe();
    }


}

function createWebComponent(config, handlers) {
    return class extends ComponentBase {
        constructor() {
            super(config, handlers)
        }

        static get observedAttributes() {
            return Object.keys(config) || [];
        }
    };
}

export { createWebComponent, ComponentBase };