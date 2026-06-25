import type { Command } from "commander";
import * as git from "../lib/git.js";
import { info, newline, text } from "../lib/logger.js";
import { createTable, showHeader, showSeparator } from "../lib/ui.js";

function statusIcon(code: string): string {
	switch (code) {
		case "M":
			return "M";
		case "A":
			return "A";
		case "D":
			return "D";
		case "?":
			return "?";
		default:
			return " ";
	}
}

export default function register(program: Command): void {
	program
		.command("status")
		.description("Show detailed repository status")
		.action(async () => {
			try {
				const status = await git.getStatus();

				showHeader(`Branch: ${status.current}`);
				if (status.tracking) {
					info(`Tracking: ${status.tracking}`);
				}

				if (status.ahead > 0 || status.behind > 0) {
					const ahead = status.ahead > 0 ? `${status.ahead} ahead` : "";
					const behind = status.behind > 0 ? `${status.behind} behind` : "";
					const sep = ahead && behind ? " | " : "";
					info(`${ahead}${sep}${behind}`);
				}

				newline();

				if (status.files.length > 0) {
					info("Files:");
					const fileRows = status.files.map((f) => [
						f.path,
						statusIcon(f.index),
						statusIcon(f.working_dir),
					]);
					text(createTable(["File", "Index", "Working"], fileRows));
				} else {
					info("Working tree clean.");
				}

				newline();
				showSeparator();
				newline();

				if (status.recentCommits.length > 0) {
					info("Recent commits:");
					const commitRows = status.recentCommits
						.slice(0, 3)
						.map((c) => [
							c.hash.substring(0, 7),
							c.date.substring(0, 10),
							c.message.substring(0, 50),
						]);
					text(createTable(["Hash", "Date", "Message"], commitRows));
				}
			} catch (err) {
				info(`Status: ${err instanceof Error ? err.message : String(err)}`);
			}
		});
}
