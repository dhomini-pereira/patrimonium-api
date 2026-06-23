import { app } from './app';
import { SERVER } from './configs/constants.config';

app.listen({ port: SERVER.PORT }, (err: Error | null, address: string) => {
  if (err) {
    console.log("[SERVER] Ocurred an error on init the server:", err.message);
    process.exit(1);
  };

  console.log("[SERVER] Running on address:", address);
  console.log("[SERVER] Listening on port:", SERVER.PORT);
});
