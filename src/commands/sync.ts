import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, text } from "../lib/logger.js";
import { withSpinner } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("sync")
		.description("Pull with rebase")
		.action(async () => {
			try {
				const result = await withSpinner("Syncing...", () => git.pullRebase());
				text(`Sync complete: ${result}`);
			} catch (err) {
				error(
					`Sync failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
