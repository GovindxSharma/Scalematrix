/**
 * ============================================================================
 * MODULAR MONOLITH: ASYNCHRONOUS IN-MEMORY DOMAIN EVENT BUS
 * ============================================================================
 * 
 * WHAT IT IS:
 * - A decoupled publish/subscribe event dispatcher using Node.js EventEmitter.
 * - Allows domains (e.g. Orders -> Inventory -> Notifications) to react to
 *   events asynchronously without locking database rows in the same transaction.
 * 
 * HOW IT WORKS:
 * - Uses `setImmediate()` to defer subscriber execution to the next tick of
 *   the event loop, ensuring HTTP request responses remain ultra-fast (<0.1ms).
 * ============================================================================
 */

import { EventEmitter } from 'events';

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  /**
   * Dispatches a domain event asynchronously to prevent blocking the HTTP thread.
   * @param {string} eventName - Name of the domain event (e.g. 'ORDER_CREATED')
   * @param {object} payload - Event data payload
   */
  publish(eventName, payload) {
    setImmediate(() => {
      this.emit(eventName, payload);
    });
  }
}

export const eventBus = new DomainEventBus();
