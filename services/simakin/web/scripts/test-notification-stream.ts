import assert from "node:assert/strict";

import { eventSourceReconnectDelay, MAX_EVENT_SOURCE_RECONNECT_ATTEMPTS } from "../src/components/strategic/event-source-reconnect.policy";

assert.equal(MAX_EVENT_SOURCE_RECONNECT_ATTEMPTS, 5, "FAIL: EventSource reconnect attempts are bounded");
assert.equal(eventSourceReconnectDelay(1), 1_000, "FAIL: first reconnect waits one second");
assert.equal(eventSourceReconnectDelay(5), 16_000, "FAIL: reconnect backoff is bounded and exponential");
assert.equal(eventSourceReconnectDelay(6), null, "FAIL: reconnect stops after the bounded retry budget");
console.log("Notification EventSource reconnect contract passed");
