import { homedir } from "node:os";
import { join } from "node:path";
import Conf from "conf";

export interface ForgeConfig {
	user: {
		name: string;
		email: string;
	};
	github: {
		encryptedToken: string;
	};
	auth: {
		machineKey: string;
		hasMasterPassword: boolean;
	};
	preferences: {
		autoPush: boolean;
		commitTemplate: string;
		editor: string;
	};
	clones: string[];
}

const DEFAULTS: ForgeConfig = {
	user: { name: "", email: "" },
	github: { encryptedToken: "" },
	auth: { machineKey: "", hasMasterPassword: false },
	preferences: {
		autoPush: false,
		commitTemplate: "",
		editor: process.env.EDITOR || "vim",
	},
	clones: [],
};

const configPath = join(homedir(), ".forge");

export class ConfigManager {
	private conf: Conf<ForgeConfig>;

	constructor(options?: { configName?: string; cwd?: string }) {
		this.conf = new Conf<ForgeConfig>({
			configName: options?.configName || "forge",
			cwd: options?.cwd || configPath,
			defaults: DEFAULTS,
		});
	}

	get(key: string): any {
		return this.conf.get(key);
	}

	set(key: string, value: any): void {
		this.conf.set(key, value);
	}

	delete(key: string): void {
		this.conf.delete(key);
	}

	clear(): void {
		this.conf.clear();
	}

	getPath(): string {
		return this.conf.path;
	}

	getAll(): ForgeConfig & { clones: string[] } {
		return {
			user: {
				name: this.conf.get("user.name") as string,
				email: this.conf.get("user.email") as string,
			},
			github: {
				encryptedToken: this.conf.get("github.encryptedToken") as string,
			},
			auth: {
				machineKey: this.conf.get("auth.machineKey") as string,
				hasMasterPassword: this.conf.get("auth.hasMasterPassword") as boolean,
			},
			preferences: {
				autoPush: this.conf.get("preferences.autoPush") as boolean,
				commitTemplate: this.conf.get("preferences.commitTemplate") as string,
				editor: this.conf.get("preferences.editor") as string,
			},
			clones: this.getClones(),
		};
	}

	addClone(entry: string): void {
		const clones = (this.conf.get("clones") as string[]) || [];
		clones.unshift(entry);
		if (clones.length > 10) clones.length = 10;
		this.conf.set("clones", clones);
	}

	getClones(): string[] {
		return (this.conf.get("clones") as string[]) || [];
	}

	isConfigured(): boolean {
		const name = this.conf.get("user.name") as string;
		const email = this.conf.get("user.email") as string;
		return !!(name && email);
	}
}
