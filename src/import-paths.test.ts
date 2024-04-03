import { RuleTester } from 'eslint';
import path from 'path';

import rule from './import-paths';

const tester = new RuleTester({
	parserOptions: {
		// eslint-disable-next-line spellcheck/spell-checker
		ecmaVersion: 6,
		sourceType: 'module',
	},
});

tester.run('import-paths', rule, {
	valid: [
		{
			name: 'relative import from not an alias directory',
			filename: path.resolve('./src/index.ts'),
			code: `import baz from './baz/index';`,
		},
		{
			name: 'import from alias root',
			filename: path.resolve('./src/index.ts'),
			code: `import baz from '@foo';`,
		},
		{
			name: 'alias import from alias directory',
			filename: path.resolve('./src/foo/index.ts'),
			code: `import z from '@foo/x/y/z';`,
		},
		{
			name: 'alias import from another alias directory',
			filename: path.resolve('./src/foo/index.ts'),
			code: `import z from '@bar/x/y/z';`,
		},
		{
			name: 'relative import from subdirectory in file under alias directory',
			filename: path.resolve('./src/foo/index.ts'),
			code: `import z from './x/y/z';`,
		},
		{
			name: 'relative import up from subdirectory in file under alias directory',
			filename: path.resolve('./src/foo/x/y/z/index.ts'),
			code: `import foo from '../../../index';`,
		},
	],
	invalid: [
		{
			name: 'relative import from alias must be fixed',
			filename: path.resolve('./src/index.ts'),
			code: `import z from './foo/x/y/z';`,
			errors: ['Update import to @foo/x/y/z'],
			output: `import z from '@foo/x/y/z';`,
		},
		{
			name: 'relative import from alias used in file under another alias must be fixed',
			filename: path.resolve('./src/foo/index.ts'),
			code: `import z from '../bar/x/y/z';`,
			errors: ['Update import to @bar/x/y/z'],
			output: `import z from '@bar/x/y/z';`,
		},
	],
});
