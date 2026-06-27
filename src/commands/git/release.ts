import type { Command } from "commander";
import { createRelease } from "../../lib/github.js";
import { error, text } from "../../lib/logger.js";
import { input, withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("release")
		.description("Create a GitHub release")
		.argument("<tag>", "Git tag name")
		.option("-n, --name <name>", "Release name")
		.action(async (tag, options) => {
			try {
				const name = options.name || (await input("Release name", tag));
				const body = await input("Release description (optional)");
				const result = await withSpinner("Creating release...", () =>
					createRelease(tag, name, body),
				);
				text(`Release created: ${result.url}`);
			} catch (err) {
				error(
					`Release creation failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
