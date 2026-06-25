# @hallaxius/forge

A modern Git CLI with professional UX

[![npm version](https://img.shields.io/npm/v/@hallaxius/forge.svg)](https://www.npmjs.com/package/@hallaxius/forge) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

## Commands (26)

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

### Worktrees
| Command | Description |
|---------|-------------|
| `fg worktree add <path> [branch] [--new] [--detach]` | Add worktree; `--new` creates branch; `--detach` detached HEAD |
| `fg worktree list` | List worktrees (path, branch, hash) |
| `fg worktree remove <path> [--force]` | Remove worktree |
| `fg worktree prune [--dry-run]` | Prune stale references |

### Merge / Cherry-pick
| Command | Description |
|---------|-------------|
| `fg merge <branch> [--no-ff] [--squash] [--no-commit]` | Merge with options |
| `fg cherry-pick <commits...> [--no-commit] [--mainline N]` | Apply commits |
| `fg cherry-pick --continue` | Continue after conflict |
| `fg cherry-pick --abort` | Abort cherry-pick |

### Clean / Archive
| Command | Description |
|---------|-------------|
| `fg clean [paths...] [--dry-run] [--force] [--exclude pattern]` | Remove untracked files; `--dry-run` shows only; without `--force` asks confirmation |
| `fg archive <tar\|tar.gz\|zip> [--prefix dir/] [--output file] [--tree-ish ref]` | Create repository archive |

### Bisect
| Command | Description |
|---------|-------------|
| `fg bisect start [bad] [good...]` | Start bisect session |
| `fg bisect bad [commit]` | Mark bad (default HEAD) |
| `fg bisect good <commits...>` | Mark good |
| `fg bisect reset` | Reset bisect state |
| `fg bisect log` | Show bisect log |
| `fg bisect run <cmd>` | Run automated bisect script |

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

## License

MIT