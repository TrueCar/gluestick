import forever from "forever-monitor";
import { getLogger } from "../lib/server/logger";
const logger = getLogger();

export default function startForever (serverEntrypointPath) {
  const child = new (forever.Monitor)(serverEntrypointPath);
  child.on("exit", () => {
    logger.info("Server exiting...");
  });
  logger.info("Server rendering server started with forever");
  child.start();
}
