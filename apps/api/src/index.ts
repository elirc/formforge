import { buildApi } from "./app.js";

export { buildApi } from "./app.js";
export { serializeOperationalEvent, type OperationalEvent, type OperationalEventSink } from "./operational-events.js";

const app = buildApi({ events: (event) => console.log(JSON.stringify(event)) });
await app.listen({ host: "127.0.0.1", port: 3002 });
