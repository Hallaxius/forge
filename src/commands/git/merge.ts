import type { Command } from "commander";
import * as git from "../../lib/git.js";
import { error, text } from "../../lib/logger.js";

export default function register(program: Command): void {
	program
		.command("merge")
		.description("Merge branches")
		.argument("<branch>", "Branch to merge into current")
		.option(
			"--no-ff",
			"Create a merge commit even when fast-forward is possible",
		)
		.option("--squash", "Squash commits into one")
		.option("--no-commit", "Perform merge but do not commit")
		.action(
			async (
				branch: string,
				options: { noFF?: boolean; squash?: boolean; noCommit?: boolean },
			) => {
				try {
					const currentBranch = await git.getCurrentBranch();
					text(`Merging '${branch}' into '${currentBranch}'...`);
					const result = await git.merge(branch, {
						noFF: options.noFF ?? undefined,
						squash: options.squash ?? undefined,
						noCommit: options.noCommit ?? undefined,
					});
					text(`Merge completed: ${result}`);
				} catch (err) {
					error(
						`Merge failed: ${err instanceof Error ? err.message : String(err)}`,
					);
				}
			},
		);
}
