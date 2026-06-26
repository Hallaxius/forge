import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, text } from "../lib/logger.js";
import { withSpinner } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("fetch")
		.description("Fetch from remote")
		.action(async () => {
			try {
				const result = await withSpinner("Fetching...", () => git.fetch());
				text(`Fetch complete: ${result}`);
			} catch (err) {
				error(
					`Fetch failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
