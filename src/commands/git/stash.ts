import type { Command } from "commander";
import * as git from "../../lib/git.js";
import { error, text } from "../../lib/logger.js";
import { createTable, input, withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("stash")
		.description("Manage stashes")
		.option("--pop", "Apply and remove latest stash")
		.option("--list", "List all stashes")
		.action(async (options) => {
			try {
				if (options.pop) {
					const result = await withSpinner("Applying stash...", () =>
						git.stashPop(),
					);
					text(`Stash popped: ${result}`);
					return;
				}

				if (options.list) {
					const stashes = await git.stashList();
					if (stashes.length === 0) {
						text("No stashes found.");
						return;
					}

					const rows = stashes.map((s) => [String(s.index), s.description]);
					text("Stashes:");
					text(createTable(["#", "Description"], rows));
					return;
				}

				await input("Stash message (optional)");
				const result = await withSpinner("Stashing...", () => git.stash());
				text(`Stash saved: ${result}`);
			} catch (err) {
				error(
					`Stash operation failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
