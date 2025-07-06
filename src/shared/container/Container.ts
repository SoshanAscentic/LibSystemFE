export interface ServiceFactory<T = any> {
  (): T;
}

export class Container {
  private services = new Map<string, ServiceFactory>();
  private singletons = new Map<string, any>();

  register<T>(key: string, factory: ServiceFactory<T>, singleton = false): void {
    this.services.set(key, factory);
    if (singleton) {
      this.singletons.set(key, null); // Mark as singleton
    }
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service '${key}' not registered`);
    }

    // Handle singletons
    if (this.singletons.has(key)) {
      let instance = this.singletons.get(key);
      if (!instance) {
        instance = factory();
        this.singletons.set(key, instance);
      }
      return instance;
    }

    return factory();
  }

  registerSingleton<T>(key: string, factory: ServiceFactory<T>): void {
    this.register(key, factory, true);
  }
}