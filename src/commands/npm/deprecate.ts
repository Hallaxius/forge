import type { Command } from "commander";
import { error, text } from "../../lib/logger.js";
import { NpmClient } from "../../lib/npmClient.js";
import { withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("deprecate <pkg_version> <message>")
		.description("Mark a package version as deprecated")
		.action(async (pkg_version: string, message: string) => {
			try {
				const [pkg, version] = pkg_version.split("@");
				if (!pkg || !version) {
					error("Invalid format. Use: <pkg>@<version>");
					return;
				}

				const npmClient = new NpmClient();
				await withSpinner(`Deprecating ${pkg}@${version}...`, () =>
					npmClient.deprecate(pkg, version, message),
				);

				text(
					`Successfully deprecated ${pkg}@${version} with message: "${message}"`,
				);
			} catch (err) {
				error(
					`Failed to deprecate version: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
