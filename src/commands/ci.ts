import type { Command } from "commander";
import { getCIStatus } from "../lib/github.js";
import { error, info } from "../lib/logger.js";
import { createTable, withSpinner } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("ci")
		.description("Check CI status")
		.action(async () => {
			try {
				const checks = await withSpinner("Fetching CI status...", () =>
					getCIStatus(),
				);
				if (checks.length === 0) {
					info("No CI checks found.");
					return;
				}
				const rows = checks.map((c) => [c.name, c.conclusion, c.branch]);
				info("CI Checks:");
				console.log(createTable(["Name", "Status", "Branch"], rows));
			} catch (err) {
				error(
					`CI check failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
