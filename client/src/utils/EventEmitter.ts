// src/utils/EventEmitter.ts
type Listener = (...args: any[]) => void;

class EventEmitter {
  private events: { [key: string]: Listener[] } = {};

  on(event: string, listener: Listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((l) => l !== listener);
    }
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(...args));
    }
  }
}

export const globalEventEmitter = new EventEmitter();
