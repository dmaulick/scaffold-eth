import { LOG_LEVEL } from "./Config";

export function log(...args: any[]) {
  console.log(...args);
}

export function debugLog(...args: any[]) {
  if (LOG_LEVEL === 'debug' || LOG_LEVEL === 'trace') {
    console.log(...args);
  }
}

export function logError(e: Error, ...args: any[]) {
  if (LOG_LEVEL === 'debug' || LOG_LEVEL === 'trace') {
    console.warn(...args, e.message);
  }
}

export function trace(...args: any[]) {
  if (LOG_LEVEL === 'trace') {
    console.log(...args);
  }
}
