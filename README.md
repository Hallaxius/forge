# @hallaxius/forge

> A modern, interactive CLI for Git and npm management.

[![npm version](https://img.shields.io/npm/v/@hallaxius/forge.svg)](https://www.npmjs.com/package/@hallaxius/forge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0.0%2B-ff69b4.svg)](https://bun.sh)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org)

---

## Features

- **Git Management**: 30+ commands (status, commit, push, branch, merge, etc.)
- **GitHub Integration**: Issues, PRs, Releases, CI Checks, OAuth 2.0 Device Flow Auth
- **npm Management**: Publish, List Packages, Orgs, Dist-Tags
- **Multi-Mode CLI**: Switch between `base`, `git`, and `npm` modes
- **Interactive UI**: Colors, Spinners, Prompts, Tables
- **Token Encryption**: AES-GCM (256-bit key) for secure storage
- **Custom Aliases**: Shortcuts for frequently used commands
- **Auto-User Data**: Automatically fetches name/email from GitHub and npm APIs

---

## Installation

### Using Bun (Recommended)
```bash
bun add -g @hallaxius/forge
```

### Using npm
```bash
npm install -g @hallaxius/forge
```

---

## Usage

### Start the CLI
```bash
fg
```

### Git Mode
```bash
fg git
fg git status
fg git commit -m "feat: add new feature"
fg git push
```

### npm Mode
```bash
fg npm
fg npm whoami
fg npm publish
```

### One-Shot Commands
Execute commands directly without entering the REPL:
```bash
fg git status
fg npm whoami
fg version
```

### Interactive Modes
Enter persistent REPL mode for git or npm:
```bash
fg git
# Now in git mode. Type commands without prefix.
git> status
git> push
git> exit

fg npm
# Now in npm mode.
npm> whoami
npm> publish
npm> exit
```

---

## Authentication

### GitHub (Default: OAuth 2.0 Device Flow)
Forge uses **OAuth 2.0 Device Flow** by default for GitHub authentication. Name and email are automatically fetched from the GitHub API.

Run:
```bash
fg git setup
```
This uses **OAuth 2.0 Device Flow** by default. Follow these steps:
1. Run the command above.
2. Open the provided URL in your browser (e.g., `https://github.com/login/device`).
3. Enter the **user code** displayed in the terminal.
4. Authorize the **Forge CLI** application.
5. Name and email are **automatically fetched** from GitHub.

**Required OAuth Scopes:**
- `user:email` – Read your email.
- `repo` – Full access to repositories (public and private).
- `read:org` – Read organization data.
- `workflow` – Manage GitHub Actions.

**Token Expiration:**
- OAuth tokens expire after **1 hour** (GitHub default).
- If expired, run `fg git setup` again to renew.

**Alternative: Personal Access Token (PAT)**
You can also use a PAT directly:
```bash
fg git setup -t YOUR_GITHUB_PAT
```
Generate a PAT from [GitHub Settings > Tokens](https://github.com/settings/tokens) with the same scopes as above.

> **Security:** All tokens are encrypted using **AES-GCM (256-bit)** and stored in `~/.config/forge/config.json`.

---

### npm (Granular Access Tokens)
Forge uses **Granular Access Tokens** for npm authentication. Name and email are automatically fetched from the npm API.

#### Granular Access Token Setup
```bash
fg npm setup
```
1. Run the command above.
2. Provide your **Granular Access Token** from [npmjs.com/settings/~/tokens](https://www.npmjs.com/settings/~/tokens).
3. Name and email are **automatically fetched** from npm.
4. If name/email are not available in the npm profile, you will be prompted to enter them.

**Token Features:**
- Restrict to specific packages or scopes.
- Set expiration date.
- Limit by IP ranges (CIDR).
- Bypass 2FA (optional).

**Alternative: Direct Token Input**
You can provide the token directly:
```bash
fg npm setup -t YOUR_NPM_TOKEN
```

---

## Commands

### Base
| Command | Description |
|---------|-------------|
| `fg` | Start interactive CLI |
| `fg mode <target>` | Switch to `npm`, `git`, or `base` |
| `fg help` | Show help |
| `fg version` | Show version |
| `fg exit` | Exit |

### Git
| Command | Description |
|---------|-------------|
| `fg git setup` | Configure GitHub auth (OAuth 2.0 Device Flow by default) |
| `fg git status` | Repository status |
| `fg git commit` | Create commit |
| `fg git push` | Push to remote |
| `fg git branch` | List branches |
| `fg git branch -n <name>` | Create branch |
| `fg git branch -s <name>` | Switch branch |
| `fg git remote` | List remotes |
| `fg git remote add <name> <url>` | Add remote |
| `fg git clone <url>` | Clone repository |
| `fg git pull` | Pull from remote |
| `fg git fetch` | Fetch from remote |
| `fg git stash` | Stash changes |
| `fg git tag` | List tags |
| `fg git merge <branch>` | Merge branch |
| `fg git log` | Commit history |
| `fg git diff` | Show changes |
| `fg git undo` | Undo last commit |
| `fg git alias` | Manage aliases |
| `fg git ci` | Check CI status |
| `fg git issue` | Manage issues |
| `fg git pr` | Manage pull requests |
| `fg git release` | Create release |
| `fg git logout` | Remove GitHub token |

### npm
| Command | Description |
|---------|-------------|
| `fg npm setup` | Configure npm auth (Granular Access Token) |
| `fg npm whoami` | Show npm user |
| `fg npm publish` | Publish package |
| `fg npm ls` | List packages |
| `fg npm package <name>` | Show package info |
| `fg npm org list` | List organizations |
| `fg npm org members` | Manage members |
| `fg npm org show` | Show organization details |
| `fg npm dist-tag` | Manage dist-tags |
| `fg npm deprecate` | Deprecate package versions |
| `fg npm logout` | Remove npm token |

---

## Configuration

| File | Location | Description |
|------|----------|-------------|
| Config | `~/.config/forge/config.json` | User settings, tokens, aliases |

### Commands
| Command | Description |
|---------|-------------|
| `fg config` | View config |
| `fg config --edit` | Edit config |
| `fg reset` | Reset all config |

---

## Version Management

Use these scripts to bump the version and publish:

```bash
# Patch version (bug fixes)
npm run patch

# Minor version (new features, backward-compatible)
npm run minor

# Major version (breaking changes)
npm run major
```

Or manually:
```bash
npm version patch
npm version minor
npm version major
npm publish
```

---

## License

MIT – see [LICENSE](LICENSE) for details.
