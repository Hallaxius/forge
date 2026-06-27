import type { Command } from "commander";
import * as git from "../../lib/git.js";
import { error, text } from "../../lib/logger.js";
import { createTable } from "../../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("tag")
		.description("Manage tags")
		.option("-n, --name <name>", "Create tag")
		.option("-m, --message <message>", "Tag message")
		.option("--list", "List tags")
		.action(async (options) => {
			try {
				if (options.list) {
					const tags = await git.tagList();
					if (tags.length === 0) {
						text("No tags found.");
						return;
					}

					const rows = tags.map((t) => [t]);
					text("Tags:");
					text(createTable(["Name"], rows));
					return;
				}

				if (options.name) {
					const tagName = await git.tag(options.name, options.message);
					text(`Tag '${tagName}' created.`);
					return;
				}

				text("Use --name to create a tag or --list to list tags.");
			} catch (err) {
				error(
					`Tag operation failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
