# Contributing to Janta Medicare

First off, thank you for considering contributing to Janta Medicare! It's people like you that make this platform great.

## 🤝 Code of Conduct
By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, welcoming, and constructive in all your interactions.

## 🛠 Branching Strategy
We use a standard branching strategy for this repository:
- `main` is our production branch. It is protected and should always be deployable.
- For new features, create a branch formatted as: `feature/your-feature-name`
- For bug fixes, create a branch formatted as: `fix/the-bug-name`

## 📝 Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps us auto-generate changelogs and version releases.
Examples:
- `feat: add robust fuzzy search to medicines`
- `fix: resolve hydration error on feedback form`
- `docs: update readme with setup instructions`

## 💻 Local Development Workflow
1. Create your feature branch from `main`.
2. Run `npm install` and start the local environment via `npm run dev` and `npx supabase start`.
3. Make your changes in the codebase.
4. **Test your code!** Run `npm run verify` (which runs linting, typechecking, and a build test) to ensure you didn't break anything. 
5. Run the End-to-End tests: `npm run test:e2e`.

## 🚀 Pull Request Process
1. Ensure your branch is up to date with `main`.
2. Push your branch to GitHub and open a Pull Request.
3. Fill out the **Pull Request Template** completely.
4. Our GitHub Actions CI pipeline will automatically run all tests and linters against your PR. **All checks must pass before merging.**
5. Request a review from a Codeowner or maintainer.
6. Once approved, your PR can be squash-merged into `main`.
