# @hallaxius/forge

> A modern, interactive CLI for Git and npm management.

[![npm version](https://img.shields.io/npm/v/@hallaxius/forge.svg)](https://www.npmjs.com/package/@hallaxius/forge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0.0%2B-ff69b4.svg)](https://bun.sh)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org)

---

## Features

- **Git Management**: 30+ commands (status, commit, push, branch, merge, etc.)
- **GitHub Integration**: Issues, PRs, Releases, CI Checks, Device Flow Auth
- **npm Management**: Publish, List Packages, Orgs, Dist-Tags
- **Multi-Mode CLI**: Switch between `base`, `git`, and `npm` modes
- **Interactive UI**: Colors, Spinners, Prompts, Tables
- **Token Encryption**: AES-GCM (256-bit key) for secure storage
- **Custom Aliases**: Shortcuts for frequently used commands

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
```bash
fg git status
fg npm whoami
fg version
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
| `fg git setup` | Configure GitHub auth |
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

### npm
| Command | Description |
|---------|-------------|
| `fg npm setup` | Configure npm auth |
| `fg npm whoami` | Show npm user |
| `fg npm publish` | Publish package |
| `fg npm ls` | List packages |
| `fg npm package <name>` | Show package info |
| `fg npm org list` | List organizations |
| `fg npm org members` | Manage members |

---

## Authentication

### GitHub
```bash
fg git setup
```
- **Device Flow (Recommended)**: Open browser to authorize.
- **Personal Access Token**: Manually enter a PAT from [GitHub Settings > Tokens](https://github.com/settings/tokens).

> Tokens are encrypted using AES-GCM and stored in `~/.config/forge/config.json`.

### npm
```bash
fg npm setup
```
- Enter your npm token from [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens).

---

## Configuration

| File | Location | Description |
|------|----------|-------------|
| Config | `~/.config/forge/config.json` | User settings, tokens, aliases |

### Commands
| Command | Description |
|---------|-------------|
| `fg setup` | Initial setup |
| `fg config` | View config |
| `fg config --edit` | Edit config |
| `fg reset` | Reset all config |

---

## License

MIT – see [LICENSE](LICENSE) for details.
