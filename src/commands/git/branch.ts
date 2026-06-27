import type { Command } from "commander";
import * as git from "../../lib/git.js";
import { error, text } from "../../lib/logger.js";
import { createTable } from "../../lib/ui.js";

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
					text(`Branch '${options.new}' created.`);
					return;
				}

				if (options.delete) {
					await git.deleteBranch(options.delete);
					text(`Branch '${options.delete}' deleted.`);
					return;
				}

				if (options.switch) {
					await git.switchBranch(options.switch);
					text(`Switched to '${options.switch}'.`);
					return;
				}

				const branches = await git.getBranches();
				const rows = branches.all.map((b) => [
					b === branches.current ? "*" : " ",
					b,
				]);
				text("Branches:");
				text(createTable(["", "Name"], rows));
			} catch (err) {
				error(
					`Branch operation failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
