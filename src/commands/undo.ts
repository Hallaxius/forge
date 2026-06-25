import type { Command } from "commander";
import * as git from "../lib/git.js";
import { error, info, success, warning } from "../lib/logger.js";
import { confirm } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("undo")
		.description("Undo last commit (soft reset)")
		.action(async () => {
			try {
				warning("This will undo the last commit using a soft reset.");
				const proceed = await confirm("Are you sure?");
				if (!proceed) {
					info("Undo cancelled.");
					return;
				}

				const result = await git.undo();
				success(`Undo complete: ${result}`);
			} catch (err) {
				error(
					`Undo failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
