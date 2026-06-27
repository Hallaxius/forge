import type { Command } from "commander";
import { ConfigManager } from "../../lib/config.js";
import { error, text } from "../../lib/logger.js";

export default function register(program: Command): void {
	program
		.command("logout")
		.description("Remove npm credentials")
		.action(() => {
			try {
				const config = new ConfigManager();
				config.delete("npm.token");
				text("npm credentials removed successfully.");
			} catch (err) {
				error(
					`Logout failed: ${err instanceof Error ? err.message : String(err)}`,
				);
			}
		});
}
