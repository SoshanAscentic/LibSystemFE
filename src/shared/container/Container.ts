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
      const registeredKeys = Array.from(this.services.keys());
      console.error(`Available services: ${registeredKeys.join(', ')}`);
      throw new Error(`Service '${key}' not registered. Available services: ${registeredKeys.join(', ')}`);
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

  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  isRegistered(key: string): boolean {
    return this.services.has(key);
  }
}