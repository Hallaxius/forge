import type { Command } from "commander";
import { error, text } from "../../lib/logger.js";
import { NpmClient } from "../../lib/npmClient.js";
import { withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
  program
    .command("publish [path]")
    .description("Publish an npm package")
    .option("--tag <tag>", "Publish with a specific tag")
    .option("--access <access>", "Set package access: public or restricted")
    .action(async (path = ".", options) => {
      try {
        const npmClient = new NpmClient();
        await withSpinner("Publishing package...", () =>
          npmClient.publish(path, {
            tag: options.tag,
            access: options.access,
          }),
        );
        text("Package published successfully.");
      } catch (err) {
        error(
          `Publish failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    });
}
