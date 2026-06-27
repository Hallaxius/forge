import chalk from "chalk";
import { colors } from "../constants/colors.js";

export function error(msg: string): void {
	console.error(chalk.hex(colors.error)(msg));
}

export function warning(msg: string): void {
	console.warn(chalk.hex(colors.warning)(`warning: ${msg}`));
}

export function success(msg: string): void {
	console.log(chalk.hex(colors.success)(msg));
}

export function info(msg: string): void {
	console.log(chalk.hex(colors.info)(msg));
}

export function text(msg: string): void {
	console.log(msg);
}

export function newline(): void {
	console.log();
}
