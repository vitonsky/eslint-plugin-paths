import { RuleTester } from 'eslint';
import path from 'path';

import rule from './alias';

const tester = new RuleTester({
	parserOptions: {
		// eslint-disable-next-line spellcheck/spell-checker
		ecmaVersion: 6,
		sourceType: 'module',
	},
});

tester.run('paths-alias', rule, {
	valid: [
		{
			name: 'relative import from not an alias directory are allowed',
			filename: path.resolve('./src/index.ts'),
			code: `import baz from './baz/index';`,
		},
		{
			name: 'import from an alias root are possible',
			filename: path.resolve('./src/index.ts'),
			code: `import baz from '@foo';`,
		},
		{
			name: 'files in alias directory may import files from the same alias',
			filename: path.resolve('./src/foo/index.ts'),
			code: `import z from '@foo/x/y/z';`,
		},
		{
			name: 'files in alias directory may import files from another aliases',
			filename: path.resolve('./src/foo/index.ts'),
			code: `import z from '@bar/x/y/z';`,
		},
		{
			name: 'relative imports from subdirectory is allowed for files inside alias',
			filename: path.resolve('./src/foo/index.ts'),
			code: `import z from './x/y/z';`,
		},
		{
			name: 'relative imports from subdirectory is allowed for files inside alias (case with escalate directory)',
			filename: path.resolve('./src/foo/x/y/z/index.ts'),
			code: `import foo from '../../../index';`,
		},
		{
			name: 'relative imports from subdirectory is allowed for files inside alias (case with out of alias directory)',
			filename: path.resolve('./src/foo/x/y/z/index.ts'),
			code: `import foo from '../../../../index';`,
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
			name: 'relative import from alias used in another alias must be fixed',
			filename: path.resolve('./src/foo/index.ts'),
			code: `import z from '../bar/x/y/z';`,
			errors: ['Update import to @bar/x/y/z'],
			output: `import z from '@bar/x/y/z';`,
		},
	],
});
