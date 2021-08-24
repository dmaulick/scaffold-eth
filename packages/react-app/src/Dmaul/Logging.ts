import { DEBUG } from "./Config";

export function log(...args: any[]) {
  if (isLoggingEnabled()) {
    console.log(...args);
  }
}

export function debugLog(...args: any[]) {
  if (isLoggingEnabled()) {
    console.log(...args);
  }
}

export function logError(e: Error, ...args: any[]) {
  if (isLoggingEnabled()) {
    console.warn(...args, e.message);
  }
}

function isLoggingEnabled() {
  return DEBUG;
}
