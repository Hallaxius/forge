import type { Command } from "commander";
import { error, text } from "../../lib/logger.js";
import { NpmClient } from "../../lib/npmClient.js";
import { withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("package <name>")
		.description("Show details of an npm package")
		.action(async (name) => {
			try {
				const npmClient = new NpmClient();
				const pkg = await withSpinner(
					`Fetching package info for ${name}...`,
					() => npmClient.packageInfo(name),
				);

				text(`Name: ${pkg.name}`);
				text(`Version: ${pkg["dist-tags"]?.latest || "N/A"}`);
				if (pkg.description) text(`Description: ${pkg.description}`);
				if (pkg.keywords?.length) text(`Keywords: ${pkg.keywords.join(", ")}`);
				if (pkg.author)
					text(
						`Author: ${typeof pkg.author === "string" ? pkg.author : pkg.author.name}`,
					);
				if (pkg.license) text(`License: ${pkg.license}`);

				text("\nLinks:");
				if (pkg.homepage) text(` Homepage: ${pkg.homepage}`);
				if (pkg.repository?.url) text(` Repository: ${pkg.repository.url}`);
				if (pkg.bugs?.url) text(` Bugs: ${pkg.bugs.url}`);

				if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
					text("\nDependencies:");
					for (const [dep, version] of Object.entries(pkg.dependencies)) {
						text(` ${dep}: ${version}`);
					}
				}
			} catch (err) {
				error(
					`Failed to load package info: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
