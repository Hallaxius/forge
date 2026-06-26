import type { Command } from "commander";
import { encryptToken, generateMachineKey } from "../../lib/auth.js";
import { ConfigManager } from "../../lib/config.js";
import { error, newline, text, warning } from "../../lib/logger.js";
import { confirm, input, password } from "../../lib/ui.js";
import { validateEmail } from "../../lib/validators.js";
import { githubDeviceFlow } from "../../lib/githubAuth.js";
import { getAccountInfo } from "../../lib/github.js";

export default function register(program: Command): void {
  program
    .command("setup")
    .description("Interactive setup wizard")
    .option("-w, --web", "Authenticate via browser (Device Flow - recommended)")
    .option("-t, --token <token>", "Provide GitHub token directly")
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
        text("Starting GitHub setup...");
        newline();

        const name = await input("Your name");

        let email = await input("Your email");
        while (!validateEmail(email)) {
          error("Invalid email format.");
          email = await input("Your email");
        }

        let rawToken: string;
        
        // Handle different authentication methods
        if (options.web) {
          // Browser-based authentication via GitHub Device Flow
          try {
            rawToken = await githubDeviceFlow();
          } catch (authErr) {
            if (authErr instanceof Error && authErr.message.includes('denied')) {
              error("GitHub authorization denied. Please try again or use manual token input.");
            } else if (authErr instanceof Error && authErr.message.includes('timeout')) {
              error("GitHub authorization timeout. Please try again.");
            } else {
              error(`GitHub authentication failed: ${authErr instanceof Error ? authErr.message : String(authErr)}`);
            }
            return;
          }
        } else if (options.token) {
          // Direct token input (non-interactive)
          rawToken = options.token;
        } else {
          // Interactive token input
          rawToken = await input(
            "GitHub token (required for remote operations)",
            { type: "password" }
          );
          if (!rawToken) {
            error(
              "GitHub token is required. Get one at https://github.com/settings/tokens",
            );
            return;
          }
        }

        // Validate the token by fetching account info
        newline();
        text("Validating GitHub token...");
        
        let account;
        try {
          account = await getAccountInfo();
        } catch (validationErr) {
          error("Invalid GitHub token. Please check your token and try again.");
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