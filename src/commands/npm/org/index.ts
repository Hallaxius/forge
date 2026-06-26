import type { Command } from "commander";
import list from "./list.js";
import show from "./show.js";
import members from "./members.js";

export default function register(program: Command): void {
  const org = program.command("org").description("Manage npm organizations");
  list(org);
  show(org);
  members(org);
}
