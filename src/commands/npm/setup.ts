import type { Command } from "commander";
import { ConfigManager } from "../../lib/config.js";
import { error, newline, text, warning } from "../../lib/logger.js";
import { NpmClient } from "../../lib/npmClient.js";
import { confirm, input, withSpinner } from "../../lib/ui.js";
import { validateEmail } from "../../lib/validators.js";

export default function register(program: Command): void {
	program
		.command("setup")
		.description("Configure npm with Granular Access Token")
		.option("-t, --token <token>", "Provide Granular Access Token directly")
		.option(
			"-s, --scopes <scopes>",
			"Required scopes (comma-separated, e.g., 'read:packages,write:packages')",
		)
		.option(
			"-w, --web",
			"Show instructions for creating a Granular Access Token",
		)
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
				text("Starting npm setup with Granular Access Token...");
				newline();

				if (options.web) {
					text("To create a Granular Access Token:");
					text("1. Visit: https://www.npmjs.com/settings/~/tokens");
					text("2. Click 'Generate New Token' (Granular Access Token)");
					text("3. Configure token settings:");
					text("   - Token name: 'forge-cli' (or any name)");
					text("   - Permissions: 'Read and Write' for packages");
					text("   - Scopes: Select specific packages or 'All Packages'");
					text("   - (Optional) Set IP ranges for security (CIDR notation)");
					text("   - Expiration: Set a future date (minimum 1 day)");
					text("4. Click 'Generate Token'");
					text("5. Copy the token and paste it below");
					newline();
				}

				let rawToken = options.token;
				if (!rawToken) {
					rawToken = await input(
						"Granular Access Token (required for npm operations)",
						{ type: "password" },
					);
					if (!rawToken) {
						error(
							"npm Granular Access Token is required. Create one at https://www.npmjs.com/settings/~/tokens",
						);
						return;
					}
				}

				newline();
				text("Validating Granular Access Token and fetching user data...");

				const npmClient = new NpmClient();

				config.set("npm.token", rawToken);

				const user = await withSpinner("Fetching user data...", () =>
					npmClient.whoami(),
				);

				let tokenInfoText = "Token: Set";
				try {
					const tokenInfo = await withSpinner("Fetching token details...", () =>
						npmClient.getTokenInfo(),
					);
					if (tokenInfo) {
						tokenInfoText = `Token: ${tokenInfo.id} (${tokenInfo.permissions.packages})`;
						if (tokenInfo.expiration) {
							tokenInfoText += ` | Expires: ${tokenInfo.expiration}`;
						}
					}
				} catch {
					tokenInfoText = "Token: Set (details unavailable)";
				}

				newline();

				let name = user.name || user.username;
				let email = user.email;

				if (!name) {
					name = await input("Your name");
				}

				if (!email || !validateEmail(email)) {
					email = await input("Your email");
					while (!validateEmail(email)) {
						error("Invalid email format.");
						email = await input("Your email");
					}
				}

				config.set("user", { name, email });

				text(
					[
						`User: ${name} <${email}>`,
						`npm Username: ${user.username}`,
						tokenInfoText,
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
