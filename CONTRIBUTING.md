# Contributing to AI Agent Infrastructure

Thank you for your interest in contributing! This project aims to make autonomous AI agents accessible to everyone.

## Ways to Contribute

### 🐛 Report Bugs

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Bun/Node version)

### 💡 Suggest Features

Have an idea? Open an issue with:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach

### 📝 Improve Documentation

Documentation improvements are always welcome:
- Fix typos or unclear sections
- Add examples
- Improve getting started guide
- Add API documentation

### 🔧 Submit Code

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `bun test`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-agent-infrastructure.git
cd ai-agent-infrastructure

# Install dependencies
bun install

# Run tests
bun test

# Run linter
bun run lint

# Build
bun run build
```

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Follow existing code style
- Add proper type annotations
- Avoid `any` when possible

### Documentation

- Document public APIs with JSDoc comments
- Update README.md for new features
- Add examples for new functionality

### Testing

- Write tests for new functionality
- Ensure existing tests pass
- Aim for good test coverage

### Commits

- Write clear commit messages
- Reference issues when applicable
- Keep commits focused and atomic

## Project Structure

```
ai-agent-infrastructure/
├── frameworks/          # Core frameworks
│   ├── agent-orchestration/
│   └── marketplace-sdk/
├── tools/              # CLI tools
│   └── agent-monitor/
├── examples/           # Example projects
├── docs/              # Documentation
└── templates/         # Starter templates
```

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Questions?

- Open a [Discussion](https://github.com/Retsumdk/ai-agent-infrastructure/discussions)
- Email: Retsumdkofficial@gmail.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

*Thank you for helping make AI agent infrastructure better!* 🚀
