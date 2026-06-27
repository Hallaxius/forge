import type { Command } from "commander";
import { error, text } from "../../../lib/logger.js";
import { NpmClient } from "../../../lib/npmClient.js";
import { withSpinner } from "../../../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("list")
		.description("List user organizations")
		.action(async () => {
			try {
				const npmClient = new NpmClient();
				const orgs = await withSpinner("Fetching organizations...", () =>
					npmClient.listUserOrgs(),
				);

				if (!orgs || orgs.length === 0) {
					text("No organizations found.");
					return;
				}

				text("Organizations:");
				for (const org of orgs) {
					text(`- ${org.name || org.orgname}`);
				}
			} catch (err) {
				error(
					`Failed to list organizations: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
