import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, info, success } from "../lib/logger.js";
import { createTable, input, withSpinner } from "../lib/ui.js";

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
					success(`Stash popped: ${result}`);
					return;
				}

				if (options.list) {
					const stashes = await git.stashList();
					if (stashes.length === 0) {
						info("No stashes found.");
						return;
					}

					const rows = stashes.map((s) => [String(s.index), s.description]);
					info("Stashes:");
					console.log(createTable(["#", "Description"], rows));
					return;
				}

				const _message = await input("Stash message (optional)");
				const result = await withSpinner("Stashing...", () => git.stash());
				success(`Stash saved: ${result}`);
			} catch (err) {
				error(
					`Stash operation failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
