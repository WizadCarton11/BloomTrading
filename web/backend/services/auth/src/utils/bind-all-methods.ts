// utils/bind-all-methods.ts
export function bindAllMethods<T extends object>(instance: T): Record<string, any> {
  const bound: Record<string, any> = {};

  const prototype = Object.getPrototypeOf(instance);
  const methodNames = Object.getOwnPropertyNames(prototype).filter(name => {
    const prop = prototype[name];
    return name !== 'constructor' && typeof prop === 'function';
  });

  for (const method of methodNames) {
    bound[method] = (instance as any)[method].bind(instance);
  }

  return bound;
}
