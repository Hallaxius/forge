import type { Command } from "commander";
import * as git from "../lib/git.js";
import { info, text } from "../lib/logger.js";

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
					info("No changes.");
					return;
				}

				text(output);
			} catch (err) {
				info(`Diff: ${err instanceof Error ? err.message : String(err)}`);
			}
		});
}
