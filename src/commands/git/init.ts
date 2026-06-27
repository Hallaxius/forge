import type { Command } from "commander";
import * as git from "../../lib/git.js";
import { error, text } from "../../lib/logger.js";

export default function register(program: Command): void {
	program
		.command("init")
		.description("Initialize a new Git repository")
		.argument("[dir]", "Target directory")
		.option("--initial-commit", "Create an initial commit")
		.option("--branch <name>", "Set initial branch name")
		.action(async (dir, options) => {
			try {
				const targetDir = dir || ".";

				await git.init(dir, { initialBranch: options.branch });

				if (options.initialCommit) {
					await git.commit("Initial commit");
				}

				const content = [`Path: ${targetDir}`].join("\n");
				text(content);

				text(`Git repository initialized at ${targetDir}.`);
			} catch (err) {
				error(
					`Init failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
