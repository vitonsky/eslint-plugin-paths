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
			options: [{}],
			filename: path.resolve('./src/index.ts'),
			code: `import globalFoo from './foo/index';`,
			errors: ['Update import to @foo/index'],
			output: `import globalFoo from '@foo/index';`,
		},
		{
			options: [{}],
			filename: path.resolve('./src/foo/index.ts'),
			code: `
			// import globalFoo from '../foo/index';
			import globalBar from '../bar/index';
			import bar1 from '../bar/1';
			// import bar2 from 'bar/1/2';
			// import bar3 from 'bar/1/2/3';

			// import globalBaz from './baz';
			// import baz1 from './baz/main';
			// import baz2 from '../baz/main';
			// import baz3 from '../../baz/main';
			`.replace(/\t/g, ''),
			errors: ['Update import to @bar/index', 'Update import to @bar/1'],
			output: `
			// import globalFoo from '../foo/index';
			import globalBar from '@bar/index';
			import bar1 from '@bar/1';
			// import bar2 from 'bar/1/2';
			// import bar3 from 'bar/1/2/3';

			// import globalBaz from './baz';
			// import baz1 from './baz/main';
			// import baz2 from '../baz/main';
			// import baz3 from '../../baz/main';
			`.replace(/\t/g, ''),
		},
	],
});
