import type { Command } from "commander";
import { error, text } from "../../../lib/logger.js";
import { NpmClient } from "../../../lib/npmClient.js";
import { withSpinner } from "../../../lib/ui.js";

export default function register(program: Command): void {
	const membersCmd = program
		.command("members")
		.description("Manage organization members");

	membersCmd
		.command("list <orgname>")
		.description("List organization members")
		.action(async (orgname: string) => {
			try {
				const npmClient = new NpmClient();
				const members = await withSpinner(
					`Fetching members for ${orgname}...`,
					() => npmClient.listOrgMembers(orgname),
				);

				if (!members || members.length === 0) {
					text(`No members found for ${orgname}.`);
					return;
				}

				text(`Members of ${orgname}:`);
				for (const member of members) {
					text(`- ${member.user.username || member.username}`);
				}
			} catch (err) {
				error(
					`Failed to list members: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	membersCmd
		.command("add <orgname> <user>")
		.description("Add a member to organization")
		.action(async (orgname: string, username: string) => {
			try {
				const npmClient = new NpmClient();
				await withSpinner(`Adding ${username} to ${orgname}...`, () =>
					npmClient.addOrgMember(orgname, username),
				);
				text(`Successfully added ${username} to ${orgname}.`);
			} catch (err) {
				error(
					`Failed to add member: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	membersCmd
		.command("rm <orgname> <user>")
		.description("Remove a member from organization")
		.action(async (orgname: string, username: string) => {
			try {
				const npmClient = new NpmClient();
				await withSpinner(`Removing ${username} from ${orgname}...`, () =>
					npmClient.removeOrgMember(orgname, username),
				);
				text(`Successfully removed ${username} from ${orgname}.`);
			} catch (err) {
				error(
					`Failed to remove member: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
