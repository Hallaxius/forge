import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function ensureDir(dirPath: string): Promise<void> {
	if (!existsSync(dirPath)) {
		await mkdir(dirPath, { recursive: true });
	}
}

export async function readJSON(path: string): Promise<any> {
	const content = await readFile(path, "utf-8");
	return JSON.parse(content);
}

export async function writeJSON(path: string, data: any): Promise<void> {
	const directory = dirname(path);
	await ensureDir(directory);
	const content = JSON.stringify(data, null, 2);
	await writeFile(path, content, "utf-8");
}
