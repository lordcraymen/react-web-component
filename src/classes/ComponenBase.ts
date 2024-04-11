class ComponentBase extends HTMLElement {
    private subscribers = new Map();
    private unsubscribe = () => {};
    private attributeChangeHandler?: any;

    constructor(attributeChangeHandler?: any) {
        super();
        this.attributeChangeHandler = attributeChangeHandler;
    }

    protected subscribe(component) {
        if (component instanceof ComponentBase && component.parentNode === this) {
            this.subscribers.set(component, component);
            return () => this.subscribers.delete(component);
        }
        throw new Error("Failed to subscribe: Component must be a ComponentBase instance and a direct child.");
    }

    protected connectedCallback() {
        this.unsubscribe = this.parentElement instanceof ComponentBase ? this.parentElement.subscribe(this) : () => {};
    }

    protected attributeChangedCallback(name, previousValue, newValue) {
        if (previousValue !== newValue) {
            this.attributeChangeHandler ? this.attributeChangeHandler(name, newValue) : this.onAttributeChange(name, newValue);
            }
    }
    
    onAttributeChange(name: any, newValue: any) {}

    protected disconnectedCallback() {
        this.unsubscribe();
        this.subscribers.clear();
    }
}

export { ComponentBase };