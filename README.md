A plugin for ESLint, to force use paths aliases according to `paths` option config in `tsconfig.json` or `jsconfig.json`, instead of relative imports.

Zero config, plug and play design.

# About

Current rule supports auto fix with `eslint --fix`, so you may automate paths correction.

Unlike other plugins like [eslint-plugin-import-alias](https://github.com/dword-design/eslint-plugin-import-alias) and [eslint-plugin-import-alias](https://github.com/steelsojka/eslint-import-alias) whose introduce their own aliases, current plugin is just use aliases config from tsconfig/jsconfig.

With `eslint-plugin-paths` you have one source of truth - your `tsconfig.json` file (or `jsconfig.json` in case you use vanilla javascript).

TODO: We have a [ticket](https://github.com/vitonsky/eslint-plugin-paths/issues/28), to implement an option to deprecate specific paths for case you want to convert aliases back to relative paths. So you will just add alias to deprecation list, then run `eslint --fix` and unnecessary aliases will be inverted back to paths. Simple and powerful for aliases management.

# Setup

Install package with `npm install -D eslint-plugin-paths`, then update eslint config

```json
{
	"plugins": [
		"eslint-plugin-paths",
	],
	"rules": {
		"paths/alias": "error"
	}
}
```

# Examples

If you have `tsconfig.json` with config below

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@foo/*": ["src/foo/*"],
			"@bar/*": ["src/bar/*"]
		}
	}
}
```

then code below will be valid

```ts
// src/index.ts

import foo from '@foo';
import barZ from '@bar/x/y/z';
import bazZ from './baz/x/y/z';
```

and this code will be invalid

```ts
// src/index.ts

import foo from './foo';
import barZ from './bar/x/y/z';
```

# Options

## configFilePath

Provide path to json file with a compiler config.

When not set, used `tsconfig.json` from root directory if exists or `jsconfig.json` if not.