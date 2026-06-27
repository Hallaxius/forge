import type { Command } from "commander";
import { ConfigManager } from "../../lib/config.js";
import { error, newline, text, warning } from "../../lib/logger.js";
import { NpmClient } from "../../lib/npmClient.js";
import { confirm, input, withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
	program
		.command("setup")
		.description("Configure npm with authentication")
		.option("-t, --token <token>", "Provide token directly (non-interactive)")
		.option("-w, --web", "Open browser for token generation (recommended)")
		.action(async (options) => {
			try {
				const config = new ConfigManager();

				if (config.get("npm.token")) {
					warning("npm is already configured. You are about to reconfigure.");
					const proceed = await confirm("Continue with reconfiguration?");
					if (!proceed) {
						text("Setup cancelled.");
						return;
					}
				}

				newline();
				text("Starting npm setup...");
				newline();

				if (options.web) {
					text("To get your npm token:");
					text("1. Visit: https://www.npmjs.com/settings/~//tokens");
					text("2. Click 'Generate New Token'");
					text("3. Select 'Automation' as token type");
					text("4. Copy the generated token");
					text("5. Paste it below");
					newline();
				}

				let rawToken = options.token;
				if (!rawToken) {
					rawToken = await input(
						"npm token (required for publish operations)",
						{ type: "password" },
					);
					if (!rawToken) {
						error(
							"npm token is required. Get one at https://www.npmjs.com/settings/tokens",
						);
						return;
					}
				}

				newline();
				text("Validating npm token...");

				const npmClient = new NpmClient();

				config.set("npm.token", rawToken);

				const user = await withSpinner("Fetching user data...", () =>
					npmClient.whoami(),
				);

				newline();
				text(
					[
						`User: ${user.name || user.username}`,
						`Email: ${user.email || "(not set)"}`,
						`Token: Set`,
						`Config: ${config.getPath()}`,
					].join("\n"),
				);
				text("npm is ready to use!");
			} catch (err) {
				error(
					`Setup failed: ${err instanceof Error ? err.message : String(err)}`,
				);
				const config = new ConfigManager();
				config.delete("npm.token");
			}
		});
}
