import type { Command } from "commander";
import * as git from "../../lib/git.js";
import { error, text, warning } from "../../lib/logger.js";
import { confirm, withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("push")
		.description("Push to remote")
		.option("--force", "Force push (with warning)")
		.action(async (options) => {
			try {
				const branch = await git.getCurrentBranch();
				text(`Pushing to origin/${branch}`);

				if (options.force) {
					warning("Force push will overwrite remote history.");
					const proceed = await confirm("Are you sure you want to force push?");
					if (!proceed) {
						text("Push cancelled.");
						return;
					}
				}

				const result = await withSpinner("Pushing...", () =>
					git.push(!!options.force),
				);
				text(`Push complete: ${result}`);
			} catch (err) {
				error(
					`Push failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
