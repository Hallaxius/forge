import type { Command } from "commander";
import { error, text } from "../../lib/logger.js";
import { NpmClient } from "../../lib/npmClient.js";
import { createTable, withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
	const distTagProgram = program
		.command("dist-tag")
		.description("Manage distribution tags");

	distTagProgram
		.command("add <pkg_version> <tag>")
		.description("Add a distribution tag to a package version")
		.action(async (pkg_version: string, tag: string) => {
			try {
				const [pkg, version] = pkg_version.split("@");
				if (!pkg || !version) {
					error("Invalid format. Use: <pkg>@<version>");
					return;
				}

				const npmClient = new NpmClient();
				await withSpinner(
					`Adding dist-tag ${tag} to ${pkg}@${version}...`,
					() => npmClient.addDistTag(pkg, version, tag),
				);

				text(`Successfully added dist-tag ${tag} to ${pkg}@${version}`);
			} catch (err) {
				error(
					`Failed to add dist-tag: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	distTagProgram
		.command("rm <pkg> <tag>")
		.description("Remove a distribution tag from a package")
		.action(async (pkg: string, tag: string) => {
			try {
				const npmClient = new NpmClient();
				await withSpinner(`Removing dist-tag ${tag} from ${pkg}...`, () =>
					npmClient.removeDistTag(pkg, tag),
				);

				text(`Successfully removed dist-tag ${tag} from ${pkg}`);
			} catch (err) {
				error(
					`Failed to remove dist-tag: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	distTagProgram
		.command("list <pkg>")
		.description("List all distribution tags for a package")
		.action(async (pkg: string) => {
			try {
				const npmClient = new NpmClient();
				const tags = await withSpinner(`Fetching dist-tags for ${pkg}...`, () =>
					npmClient.getDistTags(pkg),
				);

				if (Object.keys(tags).length === 0) {
					text(`No dist-tags found for ${pkg}`);
					return;
				}

				const headers = ["Tag", "Version"];
				const rows = Object.entries(tags).map(([tag, version]) => [
					tag,
					version as string,
				]);
				const table = createTable(headers, rows);
				text(table);
			} catch (err) {
				error(
					`Failed to list dist-tags: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
