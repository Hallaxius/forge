import type { Command } from "commander";
import { newline, text } from "../../lib/logger.js";
import { ModeManager } from "../../lib/modeManager.js";

export default function register(program: Command): void {
	program
		.command("help")
		.description("Show help for current mode")
		.action(async () => {
			const mode = ModeManager.getCurrentMode();
			text(`Forge CLI - ${mode === "base" ? "Base" : mode.toUpperCase()} Mode`);
			newline();

			if (mode === "base") {
				text("Available modes:");
				text("  fg npm  - Enter npm mode for package management");
				text("  fg git  - Enter git mode for version control");
				newline();
				text("Base commands:");
				text("  mode <target>  - Switch to target mode (npm, git, base)");
				text("  help           - Show this help");
				text("  version        - Show version");
				text("  exit           - Exit");
				newline();
				text("One-shot commands:");
				text("  fg npm whoami   - Execute whoami in npm mode");
				text("  fg git status   - Execute status in git mode");
			} else if (mode === "npm") {
				text("Available npm commands:");
				text("  setup           - Configure npm with authentication");
				text("  logout          - Remove npm credentials");
				text("  whoami          - Display npm account information");
				text("  package <name>  - Show package details");
				text("  publish         - Publish a package");
				text("  ls              - List your packages");
				text("  org             - Manage organizations");
				text("  deprecate       - Mark a version as deprecated");
				text("  dist-tag        - Manage distribution tags");
				newline();
				text("Organization commands:");
				text("  org list              - List your organizations");
				text("  org <name>            - Show organization details");
				text("  org members list <org>     - List organization members");
				text("  org members add <org> <user> - Add a member");
				text("  org members rm <org> <user>  - Remove a member");
			} else if (mode === "git") {
				text("Available git commands:");
				text("  setup           - Configure GitHub with authentication");
				text("  logout          - Remove GitHub credentials");
				text("  account         - Display account information");
				text("  alias           - Manage aliases");
				text("  branch          - Manage branches");
				text("  ci              - Check CI status");
				text("  clone           - Clone a repository");
				text("  commit          - Create a commit");
				text("  config          - Manage configuration");
				text("  diff            - Show changes");
				text("  fetch           - Fetch from remote");
				text("  init            - Initialize a repository");
				text("  issue           - Manage issues");
				text("  log             - Show commit history");
				text("  merge           - Merge branches");
				text("  pr              - Manage pull requests");
				text("  push            - Push to remote");
				text("  release         - Create a GitHub release");
				text("  remote          - Manage remotes");
				text("  reset           - Reset configuration");
				text("  stash           - Manage stashes");
				text("  status          - Show repository status");
				text("  sync            - Pull with rebase");
				text("  tag             - Manage tags");
				text("  undo            - Undo last commit");
			}

			newline();
			text("Base commands (available in all modes):");
			text("  mode <target>  - Switch to target mode");
			text("  help           - Show help");
			text("  version        - Show version");
			text("  exit           - Exit current mode or terminate");
		});
}
