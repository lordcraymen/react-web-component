class Store {
    constructor(defaults) {
      this.state = defaults || {};
      this.listeners = new Map();
    }
  
    subscribe(property, callback) {
      if (!this.listeners.has(property)) {
        this.listeners.set(property, new Set());
      }
      this.listeners.get(property).add(callback);
  
      return () => {
        this.listeners.get(property).delete(callback);
        if (this.listeners.get(property).size === 0) {
          this.listeners.delete(property);
        }
      };
    }
  
    setState(property, value) {
      this.state[property] = value;
      if (this.listeners.has(property)) {
        this.listeners.get(property).forEach((callback) => callback(value));
      }
    }
  
    getState(property) {
      return this.state[property];
    }
  }
  
  export { Store };
  