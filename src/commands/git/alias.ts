import { homedir } from "node:os";
import { join } from "node:path";
import type { Command } from "commander";
import Conf from "conf";
import { error, text } from "../../lib/logger.js";
import { createTable } from "../../lib/ui.js";

const aliasConfig = new Conf({
	configName: "forge-aliases",
	cwd: join(homedir(), ".forge"),
});

export default function register(program: Command): void {
	const alias = program.command("alias").description("Manage aliases");

	alias
		.command("add <name> <command>")
		.description("Create an alias")
		.action(async (name, command) => {
			try {
				aliasConfig.set(name, command);
				text(`Alias '${name}' created.`);
			} catch (err) {
				error(
					`Failed to create alias: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	alias
		.command("list")
		.description("List all aliases")
		.action(async () => {
			try {
				const store = aliasConfig.store as Record<string, string>;
				const entries = Object.entries(store);

				if (entries.length === 0) {
					text("No aliases configured.");
					return;
				}

				const rows = entries.map(([name, cmd]) => [name, cmd]);
				text("Aliases:");
				text(createTable(["Name", "Command"], rows));
			} catch (err) {
				error(
					`Failed to list aliases: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	alias
		.command("remove <name>")
		.description("Delete an alias")
		.action(async (name) => {
			try {
				aliasConfig.delete(name);
				text(`Alias '${name}' removed.`);
			} catch (err) {
				error(
					`Failed to remove alias: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
