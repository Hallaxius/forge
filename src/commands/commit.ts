import type { Command } from "commander";
import simpleGit from "simple-git";
import { commitTypes } from "../constants/messages.js";
import * as git from "../lib/git.js";
import { error, info, newline, success, text, warning } from "../lib/logger.js";
import { checkbox, confirm, input, select, withSpinner } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("commit")
		.description("Create a commit (interactive or quick)")
		.option("-m, --message <message>", "Quick commit message")
		.option("--amend", "Amend last commit")
		.action(async (options) => {
			try {
				if (options.amend) {
					const sg = simpleGit();
					await sg.commit("", { "--amend": null, "--no-edit": null });
					success("Last commit amended.");
					return;
				}

				if (options.message) {
					const hash = await git.commit(options.message);
					success(`Committed: ${hash}`);
					return;
				}

				const status = await git.getStatus();

				if (status.files.length === 0) {
					warning(
						"No files to commit. Stage files first or use -m for quick commit.",
					);
					return;
				}

				const fileChoices = status.files.map((f) => ({
					name: `${f.path} (${f.working_dir || f.index})`,
					value: f.path,
					checked: f.index !== " " || f.working_dir !== " ",
				}));

				const selectedFiles = await checkbox(
					"Select files to stage",
					fileChoices,
				);

				if (selectedFiles.length === 0) {
					warning("No files selected. Commit cancelled.");
					return;
				}

				const sg = simpleGit();
				await withSpinner("Staging files...", async () => {
					await sg.add(selectedFiles);
				});

				newline();
				const typeChoices = commitTypes.map((t) => ({
					name: `${t.value.padEnd(10)} ${t.description}`,
					value: t.value,
				}));
				const type = await select("Commit type", typeChoices);

				const scope = await input("Scope (optional)");

				const description = await input("Description");

				const fullMessage = scope
					? `${type}(${scope}): ${description}`
					: `${type}: ${description}`;

				newline();
				info("Commit preview:");
				text(`  ${fullMessage}`);
				newline();

				const proceed = await confirm("Proceed with commit?");
				if (!proceed) {
					info("Commit cancelled.");
					return;
				}

				const hash = await git.commit(fullMessage);
				success(`Committed: ${hash}`);
			} catch (err) {
				error(
					`Commit failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
