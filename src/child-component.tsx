import { ComponentBase } from "./classes/ComponenBase";
class ChildComponent extends ComponentBase {
    handleSubscriptionSuccess = () => {
        console.log('Successfully subscribed to parent component');
    }
}

export { ChildComponent }