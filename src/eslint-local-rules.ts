'use strict';

import { Rule } from 'eslint';
import fs from 'fs';
import path from 'path';

function findDirWithFile(filename: string) {
	let dir = path.resolve(filename);

	do {
		dir = path.dirname(dir);
	} while (!fs.existsSync(path.join(dir, filename)) && dir !== '/');

	if (!fs.existsSync(path.join(dir, filename))) {
		return null;
	}

	return dir;
}

function findAlias(
	baseDir: string,
	importPath: string,
	filePath: string,
	ignoredPaths: string[] = [],
) {
	if (fs.existsSync(path.join(baseDir, 'tsconfig.json'))) {
		const tsconfig = JSON.parse(
			fs.readFileSync(path.join(baseDir, 'tsconfig.json')).toString('utf8'),
		);

		const paths: Record<string, string[]> = tsconfig?.compilerOptions?.paths ?? {};
		for (const [alias, aliasPaths] of Object.entries(paths)) {
			// TODO: support full featured glob patterns instead of trivial cases like `@utils/*` and `src/utils/*`
			const matchedPath = aliasPaths.find((dirPath) => {
				// Remove last asterisk
				const dirPathBase = path
					.join(baseDir, dirPath)
					.split('/')
					.slice(0, -1)
					.join('/');

				if (filePath.startsWith(dirPathBase)) return false;
				if (
					ignoredPaths.some((ignoredPath) =>
						ignoredPath.startsWith(dirPathBase),
					)
				)
					return false;

				return importPath.startsWith(dirPathBase);
			});

			if (!matchedPath) continue;

			// Split import path
			// Remove basedir and slash in start
			const slicedImportPath = importPath
				.slice(baseDir.length + 1)
				.slice(path.dirname(matchedPath).length + 1);

			// Remove asterisk from end of alias
			const replacedPathSegments = path
				.join(path.dirname(alias), slicedImportPath)
				.split('/');

			// Add index in path
			return (
				replacedPathSegments.length === 1
					? [...replacedPathSegments, 'index']
					: replacedPathSegments
			).join('/');
		}
	}

	return null;
}

// TODO: implement option to force relative path instead of alias (for remove alias case)
// TODO: add tests
const rule: Rule.RuleModule = {
	meta: {
		fixable: 'code',
	},
	create(context) {
		const baseDir = findDirWithFile('package.json');

		if (!baseDir) throw new Error("Can't find base dir");

		return {
			ImportDeclaration(node) {
				const [{ ignoredPaths = [] } = {}] = context.options as [
					{ ignoredPaths: string[] },
				];

				const source = node.source.value;
				if (typeof source === 'string' && source.startsWith('.')) {
					const filename = context.getFilename();

					const resolvedIgnoredPaths = ignoredPaths.map((ignoredPath) =>
						path.normalize(path.join(path.dirname(filename), ignoredPath)),
					);

					const absolutePath = path.normalize(
						path.join(path.dirname(filename), source),
					);

					const replacement = findAlias(
						baseDir,
						absolutePath,
						filename,
						resolvedIgnoredPaths,
					);

					if (!replacement) return;

					context.report({
						node,
						message: `Update import to ${replacement}`,
						fix(fixer) {
							// TODO: preserve quotes
							const quote = `'`;
							return fixer.replaceText(
								node.source,
								quote + replacement + quote,
							);
						},
					});
				}
			},
		};
	},
};

export default rule;
