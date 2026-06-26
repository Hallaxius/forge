# @hallaxius/forge

A modal CLI for GitHub and npm with professional UX

[![npm version](https://img.shields.io/npm/v/@hallaxius/forge.svg)](https://www.npmjs.com/package/@hallaxius/forge) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![npm downloads](https://img.shields.io/npm/dt/@hallaxius/forge.svg)](https://www.npmjs.com/package/@hallaxius/forge) [![npm weekly downloads](https://img.shields.io/npm/dw/@hallaxius/forge.svg)](https://www.npmjs.com/package/@hallaxius/forge) [![GitHub stars](https://img.shields.io/github/stars/hallaxius/forge.svg?style=social)](https://github.com/hallaxius/forge/stargazers) [![GitHub forks](https://img.shields.io/github/forks/hallaxius/forge.svg?style=social)](https://github.com/hallaxius/forge/network) [![GitHub issues](https://img.shields.io/github/issues/hallaxius/forge.svg)](https://github.com/hallaxius/forge/issues) [![GitHub closed issues](https://img.shields.io/github/issues-closed/hallaxius/forge.svg)](https://github.com/hallaxius/forge/issues?q=is%3Aissue+is%3Aclosed) [![Bun](https://img.shields.io/badge/Bun-1.0.0%2B-ff69b4.svg)](https://bun.sh) [![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue.svg)](https://www.typescriptlang.org) [![Codecov](https://img.shields.io/codecov/c/github/hallaxius/forge.svg)](https://codecov.io/gh/hallaxius/forge) [![GitHub last commit](https://img.shields.io/github/last-commit/hallaxius/forge.svg)](https://github.com/hallaxius/forge/commits)

## Installation

Requires [Bun](https://bun.sh) (recommended) or Node.js >= 18.0.0.

```bash
# Using npm
npm install -g @hallaxius/forge

# Using bun
bun install -g @hallaxius/forge
```

## How It Works

Forge uses a **modal interface** inspired by tools like git and vim:

- `fg` - Enter base mode (configuration, mode switching)
- `fg npm` - Enter npm mode for package management
- `fg git` - Enter git mode for version control operations

In each mode, type commands **without prefixes**. Use `mode <target>` to switch modes, or use **one-shot commands** like `fg npm whoami` from any mode.

## Authentication Methods

Forge supports multiple authentication methods for both GitHub and npm:

### GitHub Authentication

1. **Browser Login (Recommended)**
   ```bash
   fg git setup --web
   ```
   - Uses GitHub's OAuth 2.0 Device Flow for secure authentication
   - Opens browser or displays verification code
   - **Never exposes your token in terminal history**

2. **Direct Token**
   ```bash
   fg git setup --token <your_github_token>
   ```
   - Provide token directly (useful for CI/CD)
   - Token is encrypted immediately

3. **Interactive Input**
   ```bash
   fg git setup
   ```
   - Enter token manually when prompted
   - Step-by-step guide

### npm Authentication

1. **Browser Guidance**
   ```bash
   fg npm setup --web
   ```
   - Displays step-by-step instructions to generate token from npmjs.com
   - Recommended for security

2. **Direct Token**
   ```bash
   fg npm setup --token <your_npm_token>
   ```
   - Provide token directly (useful for CI/CD)

3. **Interactive Input**
   ```bash
   fg npm setup
   ```
   - Enter token manually when prompted

**Token Storage:** All tokens are encrypted using AES-GCM via Web Crypto API and stored locally in your configuration file.

## Modal Interface

### Switching Modes

```bash
# Enter git mode
fg git

# In git mode, type commands without prefix:
git> status
git> push
git> branch -n feature/new

# Switch to npm mode from git mode
git> mode npm

# In npm mode, type commands without prefix:
npm> whoami
npm> package express
npm> publish

# Return to base mode
npm> mode base

# Or exit completely
npm> exit
```

### One-Shot Commands

Execute commands directly from any mode:

```bash
# Git commands
fg git status
fg git push --force
fg git branch -n feature/new
fg git log -n 10

# npm commands  
fg npm whoami
fg npm package lodash
fg npm publish --tag beta
fg npm org list
fg npm org my-org members list

# Mode commands
fg mode git    # Switch to git mode
fg mode npm    # Switch to npm mode
fg mode base   # Return to base mode
```

## Commands

### Base Mode Commands

Available in all modes via `fg <command>` or `fg mode base`

| Command | Description |
|---------|-------------|
| `mode <target>` | Switch to target mode (npm, git, base) |
| `help` | Show context-sensitive help |
| `version` | Show Forge version |
| `exit` | Exit current mode or terminate (in base mode) |

### Git Mode Commands

Enter with `fg git` or use one-shot `fg git <command>`

#### Configuration
| Command | Description |
|---------|-------------|
| `setup` | Configure GitHub with authentication (`--web` for browser, `--token` for direct) |
| `logout` | Remove GitHub credentials |
| `account` | Display account information (local and GitHub) |

#### Repositories
| Command | Description |
|---------|-------------|
| `clone <url\|org/repo> [dir]` | Clone repo; supports `org/repo` shorthand |
| `init [dir]` | Initialize repo |
| `remote` | List remotes |
| `remote add <name> <url>` | Add remote |
| `remote remove <name>` | Remove remote (asks confirmation) |
| `remote set-url <name> <url>` | Change remote URL |
| `remote rename <old> <new>` | Rename remote |
| `remote get-url <name>` | Show remote URL |

#### Commits
| Command | Description |
|---------|-------------|
| `commit [-m "msg"] [--amend]` | Interactive commit or quick with `-m`; `--amend` amends last |
| `undo` | Undo last commit keeping changes (soft reset) |
| `log [-n 10]` | Formatted history (hash, date, author, message) |
| `diff [--staged]` | Unstaged or staged diff |

#### Branches
| Command | Description |
|---------|-------------|
| `branch` | List branches (current marked with `*`) |
| `branch -n <name>` | Create new branch |
| `branch -d <name> [--force]` | Delete branch (`--force` = `-D`) |
| `branch -s <name>` | Switch to branch |

#### Push / Pull / Sync
| Command | Description |
|---------|-------------|
| `push [--force]` | Push to origin (confirms first; `--force` requires extra confirmation) |
| `sync` | Pull with rebase (`git pull --rebase`) |
| `fetch` | Fetch from remote |

#### Status
| Command | Description |
|---------|-------------|
| `status` | Branch, ahead/behind, modified files (table), last 3 commits |

#### Stash
| Command | Description |
|---------|-------------|
| `stash` | Save stash (prompts for message) |
| `stash --pop` | Apply and drop latest stash |
| `stash --list` | List stashes |

#### Tags
| Command | Description |
|---------|-------------|
| `tag -n <name> [-m "msg"]` | Create tag (annotated with `-m`) |
| `tag --list` | List tags |

#### Merge / Cherry-pick
| Command | Description |
|---------|-------------|
| `merge <branch> [--no-ff] [--squash] [--no-commit]` | Merge with options |
| `cherry-pick <commits...> [--no-commit] [--mainline N]` | Apply commits |
| `cherry-pick --continue` | Continue after conflict |
| `cherry-pick --abort` | Abort cherry-pick |

#### Clean
| Command | Description |
|---------|-------------|
| `clean [paths...] [--dry-run] [--force] [--exclude pattern]` | Remove untracked files; `--dry-run` shows only; without `--force` asks confirmation |

#### GitHub Integration
| Command | Description |
|---------|-------------|
| `ci` | Check CI status for the repository |
| `issue list [-s, --state <state>]` | List GitHub issues (filter by state: open, closed, all) |
| `issue create [-t, --title <title>]` | Create a new GitHub issue |
| `pr list [-s, --state <state>]` | List pull requests (filter by state: open, closed, all) |
| `pr create [-t, --title <title>] [-H, --head <branch>] [-B, --base <branch>]` | Create a new pull request |
| `release <tag> [-n, --name <name>]` | Create a GitHub release |

#### Aliases
| Command | Description |
|---------|-------------|
| `alias add <name> <command>` | Add alias (e.g., `fg alias add g commit`) |
| `alias list` | List aliases |
| `alias remove <name>` | Remove alias |

### npm Mode Commands

Enter with `fg npm` or use one-shot `fg npm <command>`

#### Configuration
| Command | Description |
|---------|-------------|
| `setup` | Configure npm with authentication (`--web` for browser guidance, `--token` for direct) |
| `logout` | Remove npm credentials |

#### Information
| Command | Description |
|---------|-------------|
| `whoami` | Display npm account information |
| `package <name>` | Show details of an npm package |
| `ls` | List packages owned by the authenticated user (`--limit`, `--offset`) |

#### Publishing
| Command | Description |
|---------|-------------|
| `publish [path]` | Publish an npm package (`--tag <tag>`, `--access <public|restricted>`) |

#### Organizations
| Command | Description |
|---------|-------------|
| `org list` | List your npm organizations |
| `org <orgname>` | Show details of an organization |
| `org members list <orgname>` | List organization members |
| `org members add <orgname> <username>` | Add a member to organization |
| `org members rm <orgname> <username>` | Remove a member from organization |

#### Package Management
| Command | Description |
|---------|-------------|
| `deprecate <pkg>@<version> <message>` | Mark a package version as deprecated |
| `dist-tag add <pkg>@<version> <tag>` | Add a distribution tag to a package version |
| `dist-tag rm <pkg> <tag>` | Remove a distribution tag from a package |
| `dist-tag list <pkg>` | List all distribution tags for a package |

## Configuration

File: `~/.forge/config.json`

```json
{
  "user": { "name": "", "email": "" },
  "github": { "token": "encrypted" },
  "npm": { "token": "encrypted" },
  "auth": { "machineKey": "...", "hasMasterPassword": false },
  "preferences": { "autoPush": false, "commitTemplate": "conventional", "editor": "vim" },
  "clones": [],
  "aliases": {}
}
```

- GitHub token encrypted with AES-GCM (Web Crypto API)
- npm token encrypted with the same security standards
- `clones`: last 10 clones for `fg clone --list`
- `aliases`: custom shortcuts
- Optional master password protection for encryption key

## GitHub OAuth Setup

To use browser-based authentication for GitHub, you need to create a GitHub OAuth App:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Application Name: `Forge CLI`
4. Set Homepage URL: `https://github.com/hallaxius/forge`
5. **Note:** Device Flow doesn't require a callback URL
6. Copy the **Client ID**
7. Set it in your environment:
   ```bash
   export GITHUB_CLIENT_ID=your_client_id_here
   # Or create a .env file:
   echo "GITHUB_CLIENT_ID=your_client_id_here" > .env
   ```

**Without Client ID:** The `--web` option will still display instructions, but you'll need to use manual token input.

## Security Features

- **Token Encryption:** All tokens are encrypted using AES-GCM via Web Crypto API
- **Secure Storage:** Tokens stored locally in `~/.forge/config.json`
- **Browser Authentication:** GitHub Device Flow never exposes tokens in terminal
- **Optional Master Password:** Extra layer of protection for encryption key
- **OAuth 2.0:** Industry-standard authentication flow for GitHub

## Common Issues

### "npm token not configured" error
Run `fg npm setup` to configure your npm token first.

### GitHub authentication timeout
Use `fg git setup --web` with a stable internet connection, or use fallback to manual token input with `fg git setup --token <your_token>`.

### "Command not found" in modal mode
Remember: in git/npm modes, type commands **without prefixes** (e.g., just `status` not `git status`).

### "Invalid mode" error
Available modes are: `npm`, `git`, `base`. Use `fg mode <target>` to switch.

## Troubleshooting

### Build Issues
```bash
# Install dependencies
bun install

# Build
bun run build

# Test
bun test
```

### Token Issues
```bash
# Verify token is configured
fg git account  # For GitHub
fg npm whoami   # For npm

# Reconfigure if needed
fg git setup
fg npm setup

# Remove and reconfigure
fg git logout
fg npm logout
fg git setup --web
fg npm setup --web
```

## Dependencies

- **[Bun](https://bun.sh)** (recommended) or **Node.js >= 18.0.0**
- **[@octokit/rest](https://github.com/octokit/rest.js)** - GitHub API client
- **[isomorphic-git](https://github.com/isomorphic-git/isomorphic-git)** - Git operations
- **[commander](https://github.com/tj/commander.js)** - CLI framework
- **[inquirer](https://github.com/SBoudrias/Inquirer.js)** - Interactive prompts
- **[chalk](https://github.com/chalk/chalk)** - Terminal colors
- **[ora](https://github.com/sindresorhus/ora)** - Spinners
- **[conf](https://github.com/sindresorhus/conf)** - Configuration management

## License

MIT