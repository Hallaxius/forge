import type { Command } from "commander";
import { error, text } from "../../lib/logger.js";
import { NpmClient } from "../../lib/npmClient.js";
import { withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
  program
    .command("whoami")
    .description("Display npm account information")
    .action(async () => {
      try {
        const npmClient = new NpmClient();
        const user = await withSpinner("Fetching npm user data...", () =>
          npmClient.whoami()
        );

        text(`Username: ${user.name || user.username}`);
        if (user.email) text(`Email: ${user.email}`);
        if (user.fullname) text(`Full Name: ${user.fullname}`);
        if (user.url) text(`Profile: ${user.url}`);
      } catch (err) {
        error(
          `Failed to load npm account: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    });
}