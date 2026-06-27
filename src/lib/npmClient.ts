import { ConfigManager } from "./config.js";

export interface NpmTokenInfo {
	id: string;
	token: string;
	created: string;
	cidrWhitelist?: string;
	permissions: {
		packages: "read-only" | "read-and-write" | "no-access";
		scopes: string[];
	};
	expiration?: string;
}

export class NpmClient {
	private readonly registry = "https://registry.npmjs.org";
	private readonly api = "https://api.npmjs.org";

	async getToken(): Promise<string> {
		const config = new ConfigManager();
		const token = config.get("npm.token");
		if (!token) {
			throw new Error("npm token not configured. Run 'fg npm setup'");
		}
		return token;
	}

	async getTokenInfo(): Promise<NpmTokenInfo | null> {
		const config = new ConfigManager();
		const token = config.get("npm.token");
		if (!token) {
			return null;
		}

		try {
			const response = await fetch(`${this.api}/-/npm/v1/tokens`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				return null;
			}

			const tokens: NpmTokenInfo[] = await response.json();
			return tokens.find((t) => t.token === token) || null;
		} catch {
			return null;
		}
	}

	async validateTokenScopes(
		requiredScopes: string[] = ["read:packages", "write:packages"],
	): Promise<boolean> {
		const tokenInfo = await this.getTokenInfo();
		if (!tokenInfo) {
			return false;
		}

		const hasAllScopes = requiredScopes.every((scope) =>
			tokenInfo.permissions.scopes.includes(scope),
		);

		return hasAllScopes;
	}

	async validateToken(): Promise<boolean> {
		try {
			const token = await this.getToken();
			const response = await fetch(`${this.api}/whoami`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	async whoami() {
		const token = await this.getToken();
		const response = await fetch(`${this.api}/whoami`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to get npm user info: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async packageInfo(name: string) {
		const response = await fetch(
			`${this.registry}/${encodeURIComponent(name)}`,
		);

		if (!response.ok) {
			throw new Error(`Package not found: ${name}`);
		}

		return response.json();
	}

	async publish(
		packagePath: string,
		options: { tag?: string; access?: string } = {},
	) {
		const { spawn } = await import("node:child_process");
		const args = ["publish"];

		if (options.tag) args.push("--tag", options.tag);
		if (options.access) args.push("--access", options.access);

		args.push(packagePath);

		return new Promise((resolve, reject) => {
			const npm = spawn("bun", args, { stdio: "inherit" });
			npm.on("close", (code) => {
				if (code === 0) resolve();
				else reject(new Error(`bun publish failed with code ${code}`));
			});
		});
	}

	async listPackages() {
		const token = await this.getToken();
		const response = await fetch(`${this.api}/-/v1/search?text=maintainer:me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to list packages: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async deprecate(pkg: string, version: string, message: string) {
		const token = await this.getToken();
		const url = `${this.registry}/${encodeURIComponent(pkg)}/-/${encodeURIComponent(pkg)}-${version}/deprecate`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ message }),
		});

		if (!response.ok) {
			throw new Error(
				`Failed to deprecate version: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async getDistTags(pkg: string) {
		const response = await fetch(`${this.registry}/${encodeURIComponent(pkg)}`);

		if (!response.ok) {
			throw new Error(`Package not found: ${pkg}`);
		}

		const data = await response.json();
		return data["dist-tags"] || {};
	}

	async addDistTag(pkg: string, version: string, tag: string) {
		const token = await this.getToken();
		const url = `${this.registry}/${encodeURIComponent(pkg)}/-/${encodeURIComponent(pkg)}-${version}/dist-tag/${tag}`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to add dist-tag: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async removeDistTag(pkg: string, tag: string) {
		const token = await this.getToken();
		const url = `${this.registry}/${encodeURIComponent(pkg)}/dist-tags/${tag}`;

		const response = await fetch(url, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to remove dist-tag: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async listUserOrgs() {
		const token = await this.getToken();
		const response = await fetch(`${this.api}/org`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to list organizations: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async getOrgInfo(orgname: string) {
		const token = await this.getToken();
		const response = await fetch(
			`${this.api}/org/${encodeURIComponent(orgname)}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error(
				`Failed to get organization info: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async listOrgMembers(orgname: string) {
		const token = await this.getToken();
		const response = await fetch(
			`${this.api}/org/${encodeURIComponent(orgname)}/members`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error(
				`Failed to list organization members: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async addOrgMember(orgname: string, username: string) {
		const token = await this.getToken();
		const response = await fetch(
			`${this.api}/org/${encodeURIComponent(orgname)}/members/${encodeURIComponent(username)}`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error(
				`Failed to add organization member: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}

	async removeOrgMember(orgname: string, username: string) {
		const token = await this.getToken();
		const response = await fetch(
			`${this.api}/org/${encodeURIComponent(orgname)}/members/${encodeURIComponent(username)}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error(
				`Failed to remove organization member: ${response.status} ${response.statusText}`,
			);
		}

		return response.json();
	}
}
