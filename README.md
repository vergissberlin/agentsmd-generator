# AGENTS.md Generator

[![Deploy to GitHub Pages](https://github.com/agentsmd-generator/agentsmd-generator/actions/workflows/deploy.yml/badge.svg)](https://github.com/agentsmd-generator/agentsmd-generator/actions/workflows/deploy.yml)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A **static web tool** to visually generate production-quality `AGENTS.md` files for your AI coding agents. Select template blocks, preview the result live, and export in one click.

🚀 **[Live Demo →](https://agentsmd-generator.github.io/agentsmd-generator)**

---

## Features

- 🧙 **Visual Wizard** – select template blocks from a card grid, preview live
- 📦 **8 built-in templates** – Frontend, Backend, Terraform, Ansible, Documentation, Linting, Testing, Security
- 💡 **3 ready-made examples** – Full-Stack App, DevOps Pipeline, Secure API
- 🌗 **Light / Dark mode** – automatic system detection + manual toggle
- 📋 **Copy to clipboard** or **download** as `AGENTS.md`
- 🔍 **Search & category filters**
- 📱 **Responsive** – works on mobile
- ✅ **Jest tests** for the core library and JSON files

---

## Getting Started

### Run locally

```bash
# Clone
git clone https://github.com/agentsmd-generator/agentsmd-generator.git
cd agentsmd-generator

# Serve (the fetch() calls need a real HTTP server)
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.

### Run tests

```bash
npm install
npm test
```

---

## Project Structure

```
/
├── index.html                    # Main wizard UI
├── package.json
├── .gitignore
├── assets/
│   └── logo.svg
├── src/
│   └── agentsmd-lib.js           # Core reusable library
├── api/
│   ├── templates/
│   │   ├── index.json            # Template index
│   │   ├── frontend.json
│   │   ├── backend.json
│   │   ├── iac-terraform.json
│   │   ├── iac-ansible.json
│   │   ├── documentation.json
│   │   ├── linter.json
│   │   ├── testing.json
│   │   └── security.json
│   └── examples/
│       ├── index.json
│       ├── fullstack-app.json
│       ├── devops-pipeline.json
│       └── secure-api.json
├── tests/
│   ├── agentsmd-lib.test.js
│   └── templates.test.js
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## Library API (`src/agentsmd-lib.js`)

The library is exposed as the global `AgentsMDLib` in browsers and as `module.exports` in Node.js.

```js
// Load templates
await AgentsMDLib.loadAllTemplates()      // → { templates: [...] }
await AgentsMDLib.loadTemplate('frontend') // → { id, name, sections, ... }

// Load examples
await AgentsMDLib.loadAllExamples()       // → { examples: [...] }
await AgentsMDLib.loadExample('fullstack-app')

// Block state
AgentsMDLib.addBlock(template)
AgentsMDLib.removeBlock('frontend')
AgentsMDLib.toggleBlock(template)          // returns true if now selected
AgentsMDLib.isSelected('frontend')
AgentsMDLib.getSelectedBlocks()
AgentsMDLib.clearBlocks()

// Generate / parse
AgentsMDLib.generateAgentsMD(selectedBlocks) // → markdown string
AgentsMDLib.parseAgentsMD(markdownString)     // → { title, sections }

// Events
AgentsMDLib.on('selectionChanged', blocks => console.log(blocks))
AgentsMDLib.off('selectionChanged', handler)
AgentsMDLib.emit('myEvent', data)
```

### Events

| Event | Payload |
|-------|---------|
| `templateLoaded` | template object |
| `allTemplatesLoaded` | index object |
| `exampleLoaded` | example object |
| `allExamplesLoaded` | index object |
| `blockAdded` | block object |
| `blockRemoved` | block object |
| `selectionChanged` | array of selected blocks |
| `selectionCleared` | `[]` |

---

## Template JSON Format

```json
{
  "id": "frontend",
  "name": "Frontend Development",
  "description": "...",
  "category": "development",
  "icon": "brand-html5",
  "tags": ["frontend", "javascript"],
  "sections": [
    {
      "id": "frontend-overview",
      "title": "Frontend Development Guidelines",
      "content": "## Frontend Development Guidelines\n\n..."
    }
  ]
}
```

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feat/my-template`
3. Add your template JSON to `api/templates/`
4. Add an entry to `api/templates/index.json`
5. Run `npm test`
6. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE).
