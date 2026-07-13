import { buildApi } from "./app.js";

const app = buildApi();
await app.listen({ host: "127.0.0.1", port: 3002 });
