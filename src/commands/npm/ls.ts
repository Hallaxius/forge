import type { Command } from "commander";
import { error, text } from "../../lib/logger.js";
import { NpmClient } from "../../lib/npmClient.js";
import { createTable, withSpinner } from "../../lib/ui.js";

export default function register(program: Command): void {
  program
    .command("ls")
    .description("List packages owned by the authenticated user")
    .option("--limit <limit>", "Maximum number of packages to fetch", "20")
    .option("--offset <offset>", "Number of packages to skip")
    .action(async (options) => {
      try {
        const npmClient = new NpmClient();
        const limit = parseInt(options.limit) || 20;
        const offset = parseInt(options.offset) || 0;

        const data = await withSpinner("Fetching user packages...", () =>
          npmClient.listPackages(),
        );

        const packages = data.objects?.map((pkg: any) => ({
          name: pkg.package.name,
          version: pkg.package.version,
          description: pkg.package.description || "",
          date: pkg.package.date?.created || pkg.package.date || "",
        })) || [];

        const slicedPackages = packages.slice(offset, offset + limit);

        if (slicedPackages.length === 0) {
          text("No packages found.");
          return;
        }

        const headers = ["Name", "Version", "Description", "Date"];
        const rows = slicedPackages.map((pkg: any) => [
          pkg.name,
          pkg.version,
          pkg.description,
          pkg.date.split("T")[0] || pkg.date,
        ]);

        text(createTable(headers, rows));
        text(`\nTotal: ${packages.length} packages (showing ${slicedPackages.length})`);
      } catch (err) {
        error(
          `Failed to list packages: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    });
}
