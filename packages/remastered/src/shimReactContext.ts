import React from "react";

let g: {
  $$remasteredContextMap?: Set<WeakRef<React.Context<any>>>;
} = {};

if (typeof global !== "undefined") {
  g = global as any;
}

/**
 * This set holds a weak reference to all the contexts
 * that will be created in the application.
 *
 * Why a WeakRef? Because it's awesome.
 * The real question is why is it so awesome?
 *
 * Holding the contexts in memory can cause memory leaks.
 * Using `WeakRef`s allow us to hold a weak reference so the contexts
 * can be GC'd any time.
 */
g.$$remasteredContextMap = new Set();

/**
 * Listen to all contexts being created!
 */
export function shim() {
  const oldCreateContext = React.createContext;
  React.createContext = function <T>(t: T) {
    const ctx = oldCreateContext(t);
    g.$$remasteredContextMap?.add(new WeakRef(ctx));
    return ctx;
  };

  function clearShim() {
    g.$$remasteredContextMap?.clear();
    React.createContext = oldCreateContext;
  }

  return clearShim;
}

/**
 * Polyfill WeakRef on environments like Cloudflare Workers,
 * which for some reason do not have this baked in.
 * It makes it a strong reference, but we can't really polyfill weak reference.
 */
if (typeof WeakRef === "undefined") {
  global.WeakRef = class WeakRef<T> {
    constructor(private readonly value: T) {}

    deref(): T | undefined {
      return this.value;
    }

    [Symbol.toStringTag]: "WeakRef";
  };
}
