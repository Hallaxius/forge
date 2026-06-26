import chalk from "chalk";
import type { Command } from "commander";
import { ConfigManager } from "../lib/config.js";
import { getAccountInfo } from "../lib/github.js";
import { error, newline, text } from "../lib/logger.js";
import { withSpinner } from "../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("account")
		.description("Display account information")
		.action(async () => {
			try {
				const config = new ConfigManager();
				const cfg = config.getAll();
				const userName = cfg.user.name || "(not set)";
				const userEmail = cfg.user.email || "(not set)";
				const hasToken = !!cfg.github.encryptedToken;
				const security = cfg.auth.hasMasterPassword
					? "Master password protected"
					: "Machine key";

				const parts: string[] = [];

				parts.push(chalk.bold("Local Config"));
				parts.push(`  Name:     ${userName}`);
				parts.push(`  Email:    ${userEmail}`);
				parts.push(
					`  Token:    ${hasToken ? "Configured (encrypted)" : "Not configured"}`,
				);
				parts.push(`  Security: ${security}`);

				if (hasToken) {
					newline();
					text("Fetching GitHub account info...");
					newline();

					const account = await withSpinner("Fetching account data...", () =>
						getAccountInfo(),
					);

					parts.push("");
					parts.push(chalk.bold("GitHub Profile"));
					parts.push(`  Username:  ${account.login}`);
					if (account.name) parts.push(`  Name:      ${account.name}`);
					if (account.email) parts.push(`  Email:     ${account.email}`);
					if (account.company) parts.push(`  Company:   ${account.company}`);
					if (account.location) parts.push(`  Location:  ${account.location}`);
					if (account.bio) parts.push(`  Bio:       ${account.bio}`);
					if (account.blog) parts.push(`  Blog:      ${account.blog}`);
					if (account.twitter) parts.push(`  Twitter:   @${account.twitter}`);
					parts.push(`  Profile:   ${account.profileUrl}`);
					parts.push("");
					parts.push(chalk.bold("Statistics"));
					parts.push(`  Repos:     ${account.publicRepos}`);
					parts.push(`  Gists:     ${account.publicGists}`);
					parts.push(`  Followers: ${account.followers}`);
					parts.push(`  Following: ${account.following}`);
					if (account.plan) parts.push(`  Plan:      ${account.plan}`);
					parts.push(
						`  Created:   ${new Date(account.createdAt).toLocaleDateString()}`,
					);

					text(parts.join("\n"));
  } else {
    text(parts.join("\n"));
    newline();
    text(
      "No GitHub token configured. Run 'fg git setup' to connect your GitHub account.",
    );
  }

  text("Account information displayed.");
			} catch (err) {
				error(
					`Failed to load account: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
