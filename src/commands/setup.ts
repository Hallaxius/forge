import type { Command } from "commander";
import { encryptToken } from "../lib/auth.js";
import { ConfigManager } from "../lib/config.js";
import { error, info, newline, success, warning } from "../lib/logger.js";
import { confirm, input, password, showBox } from "../lib/ui.js";
import {
	validateEmail,
	validateGitHubToken,
	validateGitInstalled,
} from "../lib/validators.js";

export default function register(program: Command): void {
	program
		.command("setup")
		.description("Interactive setup wizard")
		.action(async () => {
			try {
				const config = new ConfigManager();

				if (config.isConfigured()) {
					warning("Forge is already configured. You are about to reconfigure.");
					const proceed = await confirm("Continue with reconfiguration?");
					if (!proceed) {
						info("Setup cancelled.");
						return;
					}
				}

				const gitInstalled = await validateGitInstalled();
				if (!gitInstalled) {
					error("Git is not installed. Please install Git first.");
					return;
				}

				newline();
				info("Starting setup...");
				newline();

				const name = await input("Your name");

				let email = await input("Your email");
				while (!validateEmail(email)) {
					error("Invalid email format.");
					email = await input("Your email");
				}

				let token = await input("GitHub token (optional)");
				if (token && !validateGitHubToken(token)) {
					warning("Token format looks unusual. It will be saved as-is.");
				}

				if (token) {
					const encrypt = await confirm(
						"Encrypt token with a master password?",
						false,
					);
					if (encrypt) {
						const masterPassword = await password("Master password:");
						token = await encryptToken(token, masterPassword);
						success("Token encrypted successfully.");
					}
				}

				config.set("user", { name, email });
				config.set("github", { token });
				config.set("preferences", {
					autoPush: false,
					commitTemplate: "",
					editor: process.env.EDITOR || "vim",
				});

				newline();
				const tokenStatus = token
					? token.includes(":")
						? "Set (encrypted)"
						: "Set"
					: "Not set";
				showBox(
					"Configuration Complete",
					[
						`User:     ${name} <${email}>`,
						`Token:    ${tokenStatus}`,
						`Git:      Installed`,
						`Config:   ${config.getPath()}`,
					].join("\n"),
				);

				success("Forge is ready to use!");
			} catch (err) {
				error(
					`Setup failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
