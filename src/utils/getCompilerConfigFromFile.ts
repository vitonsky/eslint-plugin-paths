import { parse as parseJsonWithComments } from 'comment-json';
import fs from 'fs';
import path from 'path';

import { CompilerOptions } from '../types';

export function getCompilerConfigFromFile(
	baseDir: string,
	configFilePath?: string,
): CompilerOptions | null {
	if (!configFilePath) {
		// Looking for a config file
		for (const filename of ['tsconfig.json', 'jsconfig.json']) {
			const resolvedPath = path.resolve(path.join(baseDir, filename));
			const isFileExists = fs.existsSync(resolvedPath);
			if (isFileExists) {
				configFilePath = resolvedPath;
				break;
			}
		}

		if (!configFilePath) return null;
	}

	const tsconfig = parseJsonWithComments(
		fs.readFileSync(path.resolve(configFilePath)).toString('utf8'),
	);

	// TODO: validate options
	const { baseUrl, paths = {} } = (tsconfig as any)?.compilerOptions ?? {};

	return {
		baseUrl,
		paths,
	};
}
