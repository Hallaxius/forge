import type { Command } from "commander";
import * as git from "../../lib/git.js";
import { text } from "../../lib/logger.js";

export default function register(program: Command): void {
	program
		.command("diff")
		.description("Show changes")
		.option("--staged", "Show staged changes")
		.action(async (options) => {
			try {
				const output = options.staged
					? await git.diffStaged()
					: await git.diff();

				if (!output) {
					text("No changes.");
					return;
				}

				text(output);
			} catch (err) {
				text(`Diff: ${err instanceof Error ? err.message : String(err)}`);
			}
		});
}
