import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, info, success } from "../lib/logger.js";
import { createTable } from "../lib/ui.js";

export default function register(program: Command): void {
	const cmd = program.command("worktree").description("Manage worktrees");

	cmd
		.command("add")
		.description("Add a new worktree")
		.argument("<path>", "Path for the new worktree")
		.argument("[branch]", "Branch to checkout")
		.option("--new", "Create and checkout a new branch")
		.option("--detach", "Checkout detached HEAD")
		.action(
			async (
				path: string,
				branch: string | undefined,
				options: { new?: boolean; detach?: boolean },
			) => {
				try {
					await git.worktreeAdd(path, branch, {
						new: options.new,
						detach: options.detach,
					});
					success(`Worktree added at '${path}'.`);
				} catch (err) {
					error(
						`Worktree add failed: ${err instanceof Error ? err.message : String(err)}`,
					);
				}
			},
		);

	cmd
		.command("list")
		.description("List all worktrees")
		.action(async () => {
			try {
				const entries = await git.worktreeList();
				if (entries.length === 0) {
					info("No worktrees found.");
					return;
				}
				const rows = entries.map((e) => [e.path, e.branch, e.hash]);
				console.log(createTable(["Path", "Branch", "Hash"], rows));
			} catch (err) {
				error(
					`Worktree list failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	cmd
		.command("remove")
		.description("Remove a worktree")
		.argument("<path>", "Path of the worktree to remove")
		.option("--force", "Force removal")
		.action(async (path: string, options: { force?: boolean }) => {
			try {
				await git.worktreeRemove(path, options.force);
				success(`Worktree '${path}' removed.`);
			} catch (err) {
				error(
					`Worktree remove failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	cmd
		.command("prune")
		.description("Prune stale worktree references")
		.option("--dry-run", "Only show what would be pruned")
		.action(async (options: { dryRun?: boolean }) => {
			try {
				const result = await git.worktreePrune(options.dryRun);
				if (result.length === 0) {
					info("Nothing to prune.");
					return;
				}
				for (const line of result) {
					info(line);
				}
				success(`Pruned ${result.length} reference(s).`);
			} catch (err) {
				error(
					`Worktree prune failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
