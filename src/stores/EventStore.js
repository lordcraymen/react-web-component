class Store {
  constructor() {
    this.handlers = new Map();
    this.domElement = null;
  }

  initialize(domElement) {
    this.domElement = domElement;
  }

  addEventListener(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
      this.domElement.addEventListener(type, this.dispatchEvent.bind(this, type));
    }
    this.handlers.get(type).add(handler);
  }

  removeEventListener(type, handler) {
    if (this.handlers.has(type)) {
      const handlersSet = this.handlers.get(type);
      handlersSet.delete(handler);
      if (handlersSet.size === 0) {
        this.domElement.removeEventListener(type, this.dispatchEvent.bind(this, type));
        this.handlers.delete(type);
      }
    }
  }

  dispatchEvent(type, event) {
    if (this.handlers.has(type)) {
      const handlersSet = this.handlers.get(type);
      handlersSet.forEach(handler => handler(event));
    }
  }
}

const EventStore = new Store();
export { EventStore };
