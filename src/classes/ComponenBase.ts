class ComponentBase extends HTMLElement {
    private subscribers = new Map();
    private unsubscribe = () => {};

    subscribe(component) {
        if (component instanceof ComponentBase && component.parentNode === this) {
            this.subscribers.set(component, component);
            return () => this.subscribers.delete(component);
        }
        throw new Error("Failed to subscribe: Component must be a ComponentBase instance and a direct child.");
    }

    connectedCallback() {
        this.unsubscribe = this.parentElement instanceof ComponentBase ? this.parentElement.subscribe(this) : () => {};
    }

    disconnectedCallback() {    
        this.unsubscribe();
        this.subscribers.clear();
    }
}

export { ComponentBase };