import type { Command } from "commander";
import { error, text } from "../../../lib/logger.js";
import { NpmClient } from "../../../lib/npmClient.js";
import { withSpinner } from "../../../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("<orgname>")
		.description("Show organization details")
		.action(async (orgname: string) => {
			try {
				const npmClient = new NpmClient();
				const org = await withSpinner(
					`Fetching organization info for ${orgname}...`,
					() => npmClient.getOrgInfo(orgname),
				);

				text(`Name: ${org.name || org.orgname}`);
				if (org.description) text(`Description: ${org.description}`);
				if (org.created)
					text(`Created: ${new Date(org.created).toLocaleDateString()}`);
				if (org.modified)
					text(`Modified: ${new Date(org.modified).toLocaleDateString()}`);
			} catch (err) {
				error(
					`Failed to get organization info: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
