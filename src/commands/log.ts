import type { Command } from "commander";
import * as git from "../lib/git.js";
import { text } from "../lib/logger.js";
import { createTable } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("log")
		.description("Show commit history")
		.option("-n, --number <count>", "Number of commits", "10")
		.action(async (options) => {
			try {
				const count = parseInt(options.number, 10) || 10;
				const commits = await git.log(count);

				const rows = commits.map((c) => [
					c.hash.substring(0, 7),
					c.date.substring(0, 10),
					c.author,
					c.message.substring(0, 60),
				]);

				text(`Last ${commits.length} commits:`);
				text(createTable(["Hash", "Date", "Author", "Message"], rows));
			} catch (err) {
				text(`Log: ${err instanceof Error ? err.message : String(err)}`);
			}
		});
}
