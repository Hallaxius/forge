import { resolve } from "node:path";
import type { Command } from "commander";
import simpleGit from "simple-git";
import * as git from "../lib/git.js";
import { error, success } from "../lib/logger.js";
import { showBox } from "../lib/ui.js";

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
					const sg = simpleGit(resolve(targetDir));
					await sg.raw(["commit", "--allow-empty", "-m", "Initial commit"]);
				}

				const absPath = resolve(targetDir);
				const content = [`Path: ${absPath}`].join("\n");
				showBox("Repository Initialized", content);

				success(`Git repository initialized at ${absPath}.`);
			} catch (err) {
				error(
					`Init failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
