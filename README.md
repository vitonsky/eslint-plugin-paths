A plugin for ESLint, to force use paths aliases according to `paths` option config in `tsconfig.json` or `jsconfig.json`, instead of relative imports.

Zero config, plug and play design.

[![](https://primebits.org/badges/built-by.svg)](https://primebits.org)

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

# Donations

You can support the project to help it maintain independence and high quality:

- tell others about this package
- [suggest](https://github.com/vitonsky/eslint-plugin-paths/issues/new) new ideas, features and elegant ways to make package better
- help us by trying to reproduce [unconfirmed bug reports](https://github.com/vitonsky/eslint-plugin-paths/labels/unconfirmed)
- help us address bugs. Just ping us in issues and start work on PRs

Also, you can donate to us to vote with money for goal prioritization, to add some feature or fix some bug as soon as possible. Just donate with any method below, then leave transaction details in issue comments, or send email to [contact@vitonsky.net](mailto:contact@vitonsky.net) with issue number or feature request description. For significant donations, we will start work on your request as soon as possible.

- Monero (XMR): 861w7WuFGecR7SMpuf7GX9BBUgGJb1Xdx8z5pCpMrKY2ZeZAzS3mwZeQeJGV5RPpu35fr5dURSm587ewpHYGzNuGKGroQnD
- Bitcoin (BTC): bc1q2krassq0sa2aphkx37zn374lfjnthr5frm6s7y
- Ethereum (ETH), Tether USDT (ERC-20): 0x2463d84F46c131886CaE457412e8B6eaBc0b91a7
- Tron (TRC), Tether USDT (TRC-20): TQezzyzkfMCPJRdnYxNXrUfPj3s7kDeMBL
