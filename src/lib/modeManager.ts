export type Mode = "base" | "npm" | "git";

let currentMode: Mode = "base";

export const ModeManager = {
	getCurrentMode(): Mode {
		return currentMode;
	},

	setMode(mode: Mode): void {
		if (ModeManager.isValidMode(mode)) {
			currentMode = mode;
		} else {
			throw new Error(
				`Invalid mode: ${mode}. Valid modes: ${ModeManager.modes.join(", ")}`,
			);
		}
	},

	get modes(): Mode[] {
		return ["base", "npm", "git"];
	},

	getPrompt(): string {
		switch (currentMode) {
			case "npm":
				return "npm> ";
			case "git":
				return "git> ";
			default:
				return "> ";
		}
	},

	isValidMode(mode: string): mode is Mode {
		return ModeManager.modes.includes(mode as Mode);
	},

	reset(): void {
		currentMode = "base";
	},
};
