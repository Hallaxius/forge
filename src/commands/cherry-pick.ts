import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, info, success } from "../lib/logger.js";

export default function register(program: Command): void {
	program
		.command("cherry-pick")
		.description("Cherry-pick commits")
		.argument("[commits...]", "Commits to cherry-pick")
		.option("--no-commit", "Apply changes without committing")
		.option(
			"--mainline <number>",
			"Mainline parent for cherry-pick merge commits",
		)
		.option("--continue", "Continue after resolving conflicts")
		.option("--abort", "Abort cherry-pick in progress")
		.action(
			async (
				commits: string[],
				options: {
					noCommit?: boolean;
					mainline?: number;
					continue?: boolean;
					abort?: boolean;
				},
			) => {
				try {
					if (options.continue) {
						await git.cherryPickContinue();
						success("Cherry-pick continued.");
						return;
					}

					if (options.abort) {
						await git.cherryPickAbort();
						success("Cherry-pick aborted.");
						return;
					}

					if (commits.length === 0) {
						info("Provide at least one commit to cherry-pick.");
						return;
					}

					await git.cherryPick(commits, {
						noCommit: options.noCommit ?? undefined,
						mainline: options.mainline ?? undefined,
					});
					success(`Cherry-pick applied: ${commits.join(", ")}`);
				} catch (err) {
					error(
						`Cherry-pick failed: ${err instanceof Error ? err.message : String(err)}`,
					);
				}
			},
		);
}
