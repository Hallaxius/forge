import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, info, success } from "../lib/logger.js";
import { createTable } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("branch")
		.description("Manage branches")
		.option("-n, --new <name>", "Create new branch")
		.option("-d, --delete <name>", "Delete branch")
		.option("-s, --switch <name>", "Switch to branch")
		.action(async (options) => {
			try {
				if (options.new) {
					await git.createBranch(options.new);
					success(`Branch '${options.new}' created.`);
					return;
				}

				if (options.delete) {
					await git.deleteBranch(options.delete);
					success(`Branch '${options.delete}' deleted.`);
					return;
				}

				if (options.switch) {
					await git.switchBranch(options.switch);
					success(`Switched to '${options.switch}'.`);
					return;
				}

				const branches = await git.getBranches();
				const rows = branches.all.map((b) => [
					b === branches.current ? "*" : " ",
					b,
				]);
				info("Branches:");
				console.log(createTable(["", "Name"], rows));
			} catch (err) {
				error(
					`Branch operation failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
