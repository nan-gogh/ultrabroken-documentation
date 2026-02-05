# UltraBroken Documentation Wiki

A comprehensive, community-driven wiki documenting the UltraBroken glitch in The Legend of Zelda: Tears of the Kingdom.

## 🚀 Getting Started

This wiki uses **MkDocs** with the Material theme for easy reading and collaborative editing.

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Installation & Setup

1. **Install MkDocs and Material theme:**
   ```bash
   pip install mkdocs mkdocs-material
   ```

2. **Navigate to the project directory:**
   ```bash
   cd ultrabroken-documentation
   ```

3. **Run the local development server:**
   ```bash
   mkdocs serve
   ```

4. **Open in your browser:**
   ```
   http://localhost:8000
   ```

### Building for Deployment

To build the static site for GitHub Pages or other hosting:

```bash
mkdocs build
```

This creates a `site/` directory with all the static HTML files ready for deployment.

## 📁 Directory Structure

```
docs/
├── index.md                    # Homepage
├── meta.md                     # Meta & Advanced Tips
├── credits.md                  # Credits & Contributors
├── ultrabroken/                # Core mechanic documentation
│   ├── index.md
│   ├── introduction.md
│   ├── requirements.md
│   ├── procedure.md
│   ├── exceptions.md
│   ├── attributes.md
│   ├── theories.md
│   └── datamine.md
├── effects/                    # All effects documentation
│   ├── index.md
│   ├── wacko-boingo.md
│   ├── lift-lock.md
│   ├── ghost-glue.md
│   ├── phantom-smuggle.md
│   └── ... (15+ more effects)
├── devices/                    # Zonai Device Hacks
│   └── index.md
└── builds/                     # UltraFuse Builds
    └── index.md
```

## ✏️ Contributing

This wiki is designed for easy collaborative editing. There are two ways to contribute:

### Method 1: GitHub Web Editor (Easiest)
1. Push this repo to GitHub
2. Contributors can edit `.md` files directly in the browser
3. Submit pull requests for review
4. Changes are automatically deployed via GitHub Pages

### Method 2: Local Editing
1. Clone the repository
2. Edit markdown files in the `docs/` folder
3. Test locally with `mkdocs serve`
4. Commit and push changes

## 🌐 Deploying to GitHub Pages

To automatically publish this wiki to GitHub Pages:

1. Push the repository to GitHub
2. Add a GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy Wiki

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - run: pip install mkdocs mkdocs-material
      - run: mkdocs gh-deploy --force
```

3. Enable GitHub Pages in repository settings to deploy from `gh-pages` branch

## 📖 Navigation

- **[Full Documentation](docs/index.md)** - Start here for the complete guide
- **[Quick Start](docs/ultrabroken/introduction.md)** - Get started with the basics
- **[All Effects](docs/effects/index.md)** - Explore every documented effect
- **[Device List](docs/devices/index.md)** - Zonai device breakdowns
- **[Meta & Tips](docs/meta.md)** - Advanced strategies and references

## 🎨 Customization

Edit `mkdocs.yml` to customize:
- Site name and branding
- Colors (primary/accent)
- Navigation structure
- Theme settings

## 📝 File Format

All documentation uses **Markdown** format. Basic syntax:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- Bullet points
- Another item

1. Numbered list
2. Another item

[Link text](path/to/file.md)
```

## 🤝 Community

This is a community project! All contributors are welcomed. Whether you're:
- Discovering new effects
- Refining existing documentation
- Adding video guides
- Creating example builds

...your contributions help keep this resource accurate and comprehensive.

## 📄 License

This documentation is community-driven and maintained collaboratively.

---

**Happy glitching! 🎮**

For questions or discussions, visit the community spaces where this project is coordinated.
