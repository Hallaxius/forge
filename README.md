# @hallaxius/forge

A modern Git CLI with professional UX

[![npm version](https://img.shields.io/npm/v/@hallaxius/forge.svg)](https://www.npmjs.com/package/@hallaxius/forge) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm downloads](https://img.shields.io/npm/dt/@hallaxius/forge.svg)](https://www.npmjs.com/package/@hallaxius/forge) [![npm weekly downloads](https://img.shields.io/npm/dw/@hallaxius/forge.svg)](https://www.npmjs.com/package/@hallaxius/forge) [![GitHub stars](https://img.shields.io/github/stars/hallaxius/forge.svg?style=social)](https://github.com/hallaxius/forge/stargazers) [![GitHub forks](https://img.shields.io/github/forks/hallaxius/forge.svg?style=social)](https://github.com/hallaxius/forge/network) [![GitHub issues](https://img.shields.io/github/issues/hallaxius/forge.svg)](https://github.com/hallaxius/forge/issues) [![GitHub closed issues](https://img.shields.io/github/issues-closed/hallaxius/forge.svg)](https://github.com/hallaxius/forge/issues?q=is%3Aissue+is%3Aclosed) [![Bun](https://img.shields.io/badge/Bun-1.0.0%2B-ff69b4.svg)](https://bun.sh) [![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue.svg)](https://www.typescriptlang.org) [![Codecov](https://img.shields.io/codecov/c/github/hallaxius/forge.svg)](https://codecov.io/gh/hallaxius/forge) [![GitHub last commit](https://img.shields.io/github/last-commit/hallaxius/forge.svg)](https://github.com/hallaxius/forge/commits)

## Installation

Requires [Bun](https://bun.sh) (recommended) or Node.js >= 18.0.0.

```bash
# Using npm
npm install -g @hallaxius/forge

# Using bun
bun install -g @hallaxius/forge
```

## Configuration Tutorial (`fg setup`)

Run `fg setup` and follow the interactive steps:

1. **Name** — your name for commits
2. **Email** — your email for commits
3. **GitHub Token** (optional) — for authenticated operations
4. **Encrypt token?** — if yes, set a master password (AES-GCM)
5. **Verification** — confirms Git is installed

Config saved to `~/.forge/config.json`. Token is encrypted.

To reconfigure: run `fg setup` again.

## Commands (30)

### Configuration
| Command | Description |
|---------|-------------|
| `fg setup` | Initial interactive configuration |
| `fg config` | Show current config |
| `fg config --edit` | Open in `$EDITOR` (vim default) |
| `fg reset` | Delete all configuration (with confirmation) |
| `fg version` | Show version |
| `fg help` | Full help |
| `fg --help` | Quick help |
| `fg account` | Display account information (local and GitHub) |

### Repositories
| Command | Description |
|---------|-------------|
| `fg clone <url\|org/repo> [dir] [--ssh] [--depth N] [--branch X] [--recurse-submodules] [--cd]` | Clone repo; supports `org/repo` shorthand; `--cd` prints `cd dir` for `eval` |
| `fg init [dir] [--initial-commit] [--branch main]` | Initialize repo; `--initial-commit` creates empty commit |
| `fg remote` | List remotes |
| `fg remote add <name> <url>` | Add remote |
| `fg remote remove <name>` | Remove remote (asks confirmation) |
| `fg remote set-url <name> <url>` | Change remote URL |
| `fg remote rename <old> <new>` | Rename remote |
| `fg remote get-url <name>` | Show remote URL |

### Commits
| Command | Description |
|---------|-------------|
| `fg commit [-m "msg"] [--amend]` | Interactive commit (type, scope, description) or quick with `-m`; `--amend` amends last |
| `fg undo` | Undo last commit keeping changes (soft reset) |
| `fg log [-n 10]` | Formatted history (hash, date, author, message) |
| `fg diff [--staged]` | Unstaged or staged diff |

### Branches
| Command | Description |
|---------|-------------|
| `fg branch` | List branches (current marked with `*`) |
| `fg branch -n <name>` | Create new branch |
| `fg branch -d <name> [--force]` | Delete branch (`--force` = `-D`) |
| `fg branch -s <name>` | Switch to branch |

### Push / Pull / Sync
| Command | Description |
|---------|-------------|
| `fg push [--force]` | Push to origin (confirms first; `--force` requires extra confirmation) |
| `fg sync` | Pull with rebase (`git pull --rebase`) |
| `fg fetch` | Fetch from remote |

### Status
| Command | Description |
|---------|-------------|
| `fg status` | Branch, ahead/behind, modified files (table), last 3 commits |
| `fg st` | Short status |

### Stash
| Command | Description |
|---------|-------------|
| `fg stash` | Save stash (prompts for message) |
| `fg stash --pop` | Apply and drop latest stash |
| `fg stash --list` | List stashes |

### Tags
| Command | Description |
|---------|-------------|
| `fg tag -n <name> [-m "msg"]` | Create tag (annotated with `-m`) |
| `fg tag --list` | List tags |

### Merge / Cherry-pick
| Command | Description |
|---------|-------------|
| `fg merge <branch> [--no-ff] [--squash] [--no-commit]` | Merge with options |
| `fg cherry-pick <commits...> [--no-commit] [--mainline N]` | Apply commits |
| `fg cherry-pick --continue` | Continue after conflict |
| `fg cherry-pick --abort` | Abort cherry-pick |

### Clean
| Command | Description |
|---------|-------------|
| `fg clean [paths...] [--dry-run] [--force] [--exclude pattern]` | Remove untracked files; `--dry-run` shows only; without `--force` asks confirmation |

### GitHub Integration
| Command | Description |
|---------|-------------|
| `fg ci` | Check CI status for the repository |
| `fg issue list [-s, --state <state>]` | List GitHub issues (filter by state: open, closed, all) |
| `fg issue create [-t, --title <title>]` | Create a new GitHub issue |
| `fg pr list [-s, --state <state>]` | List pull requests (filter by state: open, closed, all) |
| `fg pr create [-t, --title <title>] [-H, --head <branch>] [-B, --base <branch>]` | Create a new pull request |
| `fg release <tag> [-n, --name <name>]` | Create a GitHub release |

### Aliases
| Command | Description |
|---------|-------------|
| `fg alias add <name> <command>` | Add alias (e.g., `fg alias add g commit`) |
| `fg alias list` | List aliases |
| `fg alias remove <name>` | Remove alias |

## Configuration

File: `~/.forge/config.json`

```json
{
  "user": { "name": "", "email": "" },
  "github": { "token": "encrypted" },
  "preferences": { "autoPush": false, "commitTemplate": "conventional", "editor": "vim" },
  "clones": [],
  "aliases": {}
}
```

- GitHub token encrypted with AES-GCM (Web Crypto API)
- `clones`: last 10 clones for `fg clone --list`
- `aliases`: custom shortcuts

## Dependencies

- **[Bun](https://bun.sh)** (recommended) or **Node.js >= 18.0.0**
- **[@octokit/rest](https://github.com/octokit/rest.js)** - GitHub API client
- **[isomorphic-git](https://github.com/isomorphic-git/isomorphic-git)** - Git operations
- **[commander](https://github.com/tj/commander.js)** - CLI framework
- **[inquirer](https://github.com/SBoudrias/Inquirer.js)** - Interactive prompts
- **[chalk](https://github.com/chalk/chalk)** - Terminal colors
- **[ora](https://github.com/sindresorhus/ora)** - Spinners

## License

MIT