type Subscription = () => void;
type Constructor<T = any> = new (...args: any[]) => T;
export const withSubscriptionsMixin = <T extends Constructor>(Base: T) => {
  return class extends Base {
    protected subscriptions: Subscription[] = [];
    protected unsubscribeAll() {
      this.subscriptions.forEach((unsubscribe) => unsubscribe());
      this.subscriptions = [];
    }

    public destroy() {
      super.destroy?.();
      this.unsubscribeAll();
    }

    protected addSubscription(subscription: Subscription) {
      this.subscriptions.push(subscription);
    }
  };
};

export const WithSubscriptions = withSubscriptionsMixin(class {});
