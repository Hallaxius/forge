import type { Command } from "commander";
import { newline, text } from "../../lib/logger.js";
import { createTable } from "../../lib/ui.js";

const commands: { name: string; description: string }[] = [
	{ name: "setup", description: "Interactive setup wizard" },
	{ name: "commit", description: "Create a commit (interactive or quick)" },
	{ name: "push", description: "Push to remote" },
	{ name: "sync", description: "Pull with rebase" },
	{ name: "fetch", description: "Fetch from remote" },
	{ name: "status", description: "Show detailed repository status" },
	{ name: "log", description: "Show commit history" },
	{ name: "diff", description: "Show changes" },
	{ name: "branch", description: "Manage branches" },
	{ name: "stash", description: "Manage stashes" },
	{ name: "tag", description: "Manage tags" },
	{ name: "alias", description: "Manage aliases" },
	{ name: "config", description: "Manage configuration" },
	{ name: "undo", description: "Undo last commit (soft reset)" },
	{ name: "reset", description: "Reset all configuration" },
	{ name: "help", description: "Show this help" },
	{ name: "version", description: "Show version" },
];

export default function register(program: Command): void {
	program
		.command("help")
		.description("Show comprehensive help")
		.action(async () => {
			text("Forge - Git CLI");

			const rows = commands.map((c) => [c.name, c.description]);
			text(createTable(["Command", "Description"], rows));

			newline();
			text("Usage Examples");
			text("");
			text("  fg setup                          Start interactive setup");
			text('  fg commit -m "fix: resolve issue"  Quick commit with message');
			text("  fg commit                         Interactive commit");
			text("  fg push                           Push current branch");
			text(
				"  fg push --force                   Force push (with confirmation)",
			);
			text("  fg status                         Show repository status");
			text("  fg log -n 20                      Show last 20 commits");
			text("  fg branch -n feature-x            Create a new branch");
			text("  fg branch -s feature-x            Switch to a branch");
			text("  fg sync                           Pull with rebase");
			text("  fg diff --staged                  Show staged changes");
			text("  fg stash                          Stash changes");
			text("  fg stash --pop                    Apply latest stash");
			text("  fg alias add co checkout           Create an alias");
			text("  fg config --show                  View configuration");
			text("  fg config --edit                  Edit configuration");
			newline();
		});
}
