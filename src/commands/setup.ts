import type { Command } from "commander";
import { encryptToken, generateMachineKey } from "../lib/auth.js";
import { ConfigManager } from "../lib/config.js";
import { error, info, newline, success, warning } from "../lib/logger.js";
import { confirm, input, password, showBox } from "../lib/ui.js";
import { validateEmail } from "../lib/validators.js";

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

				newline();
				info("Starting setup...");
				newline();

				const name = await input("Your name");

				let email = await input("Your email");
				while (!validateEmail(email)) {
					error("Invalid email format.");
					email = await input("Your email");
				}

				const rawToken = await input(
					"GitHub token (required for remote operations)",
				);
				if (!rawToken) {
					error(
						"GitHub token is required. Get one at https://github.com/settings/tokens",
					);
					return;
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
				showBox(
					"Configuration Complete",
					[
						`User:     ${name} <${email}>`,
						`Token:    Set (encrypted)`,
						`Security: ${hasMasterPassword ? "Master password protected" : "Machine key"}`,
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
