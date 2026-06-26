import type { Command } from "commander";
import { createIssue, listIssues } from "../lib/github.js";
import { error, text } from "../lib/logger.js";
import { createTable, input, withSpinner } from "../lib/ui.js";

export default function register(program: Command): void {
	const issue = program.command("issue").description("Manage issues");

	issue
		.command("create")
		.description("Create an issue")
		.option("-t, --title <title>", "Issue title")
		.action(async (options) => {
			try {
				const title = options.title || (await input("Issue title"));
				if (!title) {
					error("Title is required.");
					return;
				}
				const body = await input("Description (optional)");
				const result = await withSpinner("Creating issue...", () =>
					createIssue(title, body),
				);
				text(`Issue #${result.number} created: ${result.url}`);
			} catch (err) {
				error(
					`Issue creation failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});

	issue
		.command("list")
		.description("List issues")
		.option(
			"-s, --state <state>",
			"Filter by state (open, closed, all)",
			"open",
		)
		.action(async (options) => {
			try {
				const issues = await withSpinner("Fetching issues...", () =>
					listIssues(options.state),
				);
				if (issues.length === 0) {
					text("No issues found.");
					return;
				}
				const rows = issues.map((i) => [
					`#${i.number}`,
					i.title.substring(0, 60),
					i.state,
					i.author,
				]);
				text("Issues:");
				text(createTable(["#", "Title", "State", "Author"], rows));
			} catch (err) {
				error(
					`Failed to list issues: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
