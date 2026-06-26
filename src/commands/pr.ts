import type { Command } from "commander";
import { createPR, listPRs } from "../lib/github.js";
import { error, text } from "../lib/logger.js";
import { createTable, input, withSpinner } from "../lib/ui.js";

export default function register(program: Command): void {
	const pr = program.command("pr").description("Manage pull requests");

	pr.command("create")
		.description("Create a pull request")
		.option("-t, --title <title>", "PR title")
		.option("-H, --head <branch>", "Source branch (default: current branch)")
		.option("-B, --base <branch>", "Target branch (default: main)")
		.action(async (options) => {
			try {
				const title = options.title || (await input("PR title"));
				if (!title) {
					error("Title is required.");
					return;
				}
				const head = options.head || (await input("Source branch"));
				const base = options.base || (await input("Target branch", "main"));
				const body = await input("Description (optional)");
				const result = await withSpinner("Creating PR...", () =>
					createPR(title, body, head, base),
				);
				text(`PR #${result.number} created: ${result.url}`);
			} catch (err) {
				error(
					`PR creation failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	pr.command("list")
		.description("List pull requests")
		.option(
			"-s, --state <state>",
			"Filter by state (open, closed, all)",
			"open",
		)
		.action(async (options) => {
			try {
				const prs = await withSpinner("Fetching PRs...", () =>
					listPRs(options.state),
				);
				if (prs.length === 0) {
					text("No pull requests found.");
					return;
				}
				const rows = prs.map((p) => [
					`#${p.number}`,
					p.title.substring(0, 60),
					p.state,
					p.author,
				]);
				text("Pull Requests:");
				text(createTable(["#", "Title", "State", "Author"], rows));
			} catch (err) {
				error(
					`Failed to list PRs: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
