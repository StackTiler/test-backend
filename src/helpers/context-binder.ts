export class ThisContextBinder {
  
    public static bindControllerMethods(controller: object): void {
        const proto = Object.getPrototypeOf(controller);
  
        Object.getOwnPropertyNames(proto).forEach((key) => {
          const value = (controller as any)[key];
          if (typeof value === "function") {
            (controller as any)[key] = value.bind(controller);
          }
        });
    }        
}