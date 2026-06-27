import type { Command } from "commander";
import * as git from "../../lib/git.js";
import { error, text } from "../../lib/logger.js";
import { confirm, createTable } from "../../lib/ui.js";

export default function register(program: Command): void {
	const remote = program.command("remote").description("Manage remotes");

	remote
		.command("add <name> <url>")
		.description("Add a new remote")
		.action(async (name, url) => {
			try {
				await git.remoteAdd(name, url);
				text(`Remote '${name}' added (${url}).`);
			} catch (err) {
				error(
					`Failed to add remote: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	remote
		.command("remove <name>")
		.description("Remove a remote")
		.action(async (name) => {
			try {
				const confirmed = await confirm(
					`Are you sure you want to remove remote '${name}'?`,
					false,
				);

				if (!confirmed) {
					text("Canceled.");
					return;
				}

				await git.remoteRemove(name);
				text(`Remote '${name}' removed.`);
			} catch (err) {
				error(
					`Failed to remove remote: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	remote
		.command("set-url <name> <new-url>")
		.description("Change a remote URL")
		.action(async (name, newUrl) => {
			try {
				await git.remoteSetUrl(name, newUrl);
				text(`Remote '${name}' URL updated to ${newUrl}.`);
			} catch (err) {
				error(
					`Failed to update remote URL: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	remote
		.command("rename <old-name> <new-name>")
		.description("Rename a remote")
		.action(async (oldName, newName) => {
			try {
				await git.remoteRename(oldName, newName);
				text(`Remote '${oldName}' renamed to '${newName}'.`);
			} catch (err) {
				error(
					`Failed to rename remote: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	remote
		.command("get-url <name>")
		.description("Get the URL of a remote")
		.action(async (name) => {
			try {
				const url = await git.remoteGetUrl(name);
				text(`Remote '${name}': ${url}`);
			} catch (err) {
				error(
					`Failed to get remote URL: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	remote.action(async () => {
		try {
			const remotes = await git.remoteList();

			if (remotes.length === 0) {
				text("No remotes configured.");
				return;
			}

			const rows = remotes.map((r) => [r.name, r.url]);
			text("Remotes:");
			text(createTable(["Name", "URL"], rows));
		} catch (err) {
			error(
				`Failed to list remotes: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	});
}
