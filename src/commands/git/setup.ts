import type { Command } from "commander";
import { encryptToken, generateMachineKey } from "../../lib/auth.js";
import { ConfigManager } from "../../lib/config.js";
import { getAccountInfo } from "../../lib/github.js";
import { githubDeviceFlow } from "../../lib/githubAuth.js";
import { error, newline, text, warning } from "../../lib/logger.js";
import { confirm, input, password } from "../../lib/ui.js";
import { validateEmail } from "../../lib/validators.js";

export default function register(program: Command): void {
	program
		.command("setup")
		.description("Configure GitHub with OAuth 2.0 Device Flow (default)")
		.option(
			"-t, --token <token>",
			"Provide GitHub Personal Access Token directly",
		)
		.option("-w, --web", "Authenticate via browser (Device Flow - explicit)")
		.action(async (options) => {
			try {
				const config = new ConfigManager();

				if (config.isConfigured()) {
					warning("Forge is already configured. You are about to reconfigure.");
					const proceed = await confirm("Continue with reconfiguration?");
					if (!proceed) {
						text("Setup cancelled.");
						return;
					}
				}

				newline();
				text("Starting GitHub setup with OAuth 2.0 Device Flow (default)...");
				newline();

				let rawToken: string;

				if (options.token) {
					rawToken = options.token;
				} else {
					try {
						rawToken = await githubDeviceFlow();
					} catch (authErr) {
						if (
							authErr instanceof Error &&
							authErr.message.includes("denied")
						) {
							error(
								"GitHub authorization denied. Please try again or use a Personal Access Token with -t.",
							);
						} else if (
							authErr instanceof Error &&
							authErr.message.includes("timeout")
						) {
							error(
								"GitHub authorization timeout. Please try again or use a Personal Access Token with -t.",
							);
						} else {
							error(
								`GitHub OAuth failed: ${authErr instanceof Error ? authErr.message : String(authErr)}`,
							);
						}
						return;
					}
				}

				newline();
				text("Validating GitHub token and fetching user data...");

				let account: any;
				try {
					config.set("github.encryptedToken", rawToken);
					account = await getAccountInfo();
				} catch (_validationErr) {
					error("Invalid GitHub token. Please check your token and try again.");
					return;
				}

				newline();

				let name = account.name;
				let email = account.email;

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

				const useMasterPassword = await confirm(
					"Protect token with a master password? (recommended)",
					true,
				);

				const machineKey = generateMachineKey();
				let hasMasterPassword = false;

				if (useMasterPassword) {
					const mp = await password("Master password:");
					const encryptedKey = await encryptToken(machineKey, mp);
					config.set("auth.machineKey", encryptedKey);
					config.set("auth.hasMasterPassword", true);
					hasMasterPassword = true;
				} else {
					config.set("auth.machineKey", machineKey);
					config.set("auth.hasMasterPassword", false);
				}

				const encryptedToken = await encryptToken(rawToken, machineKey);
				config.set("github.encryptedToken", encryptedToken);

				config.set("user", { name, email });
				config.set("preferences", {
					autoPush: false,
					commitTemplate: "",
					editor: process.env.EDITOR || "vim",
				});

				newline();
				text(
					[
						`User: ${name} <${email}>`,
						`GitHub User: ${account.login}`,
						`Token: Set (encrypted)`,
						`Security: ${hasMasterPassword ? "Master password protected" : "Machine key"}`,
						`Config: ${config.getPath()}`,
					].join("\n"),
				);
				text("Forge is ready to use!");
			} catch (err) {
				error(
					`Setup failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
