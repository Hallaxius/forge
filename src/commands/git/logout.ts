import type { Command } from "commander";
import { ConfigManager } from "../../lib/config.js";
import { error, text } from "../../lib/logger.js";

export default function register(program: Command): void {
	program
		.command("logout")
		.description("Remove GitHub credentials")
		.action(() => {
			try {
				const config = new ConfigManager();
				config.delete("github.encryptedToken");
				config.delete("auth.machineKey");
				config.delete("auth.hasMasterPassword");
				text("GitHub credentials removed successfully.");
			} catch (err) {
				error(
					`Logout failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
