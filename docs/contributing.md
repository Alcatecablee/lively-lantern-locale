
# Contributing Guide

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/neurolint.git
   cd neurolint
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Guidelines

### Code Style

#### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type
- Use meaningful variable names

#### React Components
- Use functional components with hooks
- Implement proper prop types
- Follow single responsibility principle
- Write self-documenting code

#### CSS/Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing
- Support dark/light themes

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(analyzer): add React Hook dependency analyzer
fix(auth): resolve login redirect issue
docs(api): update authentication documentation
```

### Testing Requirements

#### Unit Tests
- Test all utility functions
- Test custom hooks
- Test component logic
- Maintain >80% code coverage

#### Integration Tests
- Test API endpoints
- Test authentication flows
- Test payment processing
- Test user journeys

#### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Pull Request Process

1. **Update documentation** for any new features
2. **Write or update tests** for your changes
3. **Ensure all tests pass** and linting is clean
4. **Update the README** if needed
5. **Create detailed PR description**

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
Include screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Code Review Guidelines

#### For Reviewers
- Focus on code quality and maintainability
- Check for security issues
- Verify test coverage
- Ensure documentation is updated
- Be constructive and respectful

#### For Contributors
- Respond to feedback promptly
- Make requested changes
- Keep discussions focused on the code
- Ask questions if feedback is unclear

### Feature Development

#### New Analyzers
1. Create analyzer class in `src/utils/analyzer/`
2. Implement required interfaces
3. Add comprehensive tests
4. Update documentation
5. Add to main analyzer registration

#### UI Components
1. Follow existing component structure
2. Use TypeScript for props
3. Implement accessibility features
4. Add responsive design
5. Support theming

### Bug Reports

When reporting bugs, include:
- **Description** of the issue
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment details** (browser, OS, etc.)
- **Screenshots** if applicable

### Feature Requests

When requesting features, include:
- **Use case** description
- **Problem** it solves
- **Proposed solution**
- **Alternatives considered**
- **Additional context**

### Community Guidelines

- Be respectful and inclusive
- Help newcomers get started
- Share knowledge and best practices
- Follow the code of conduct
- Provide constructive feedback

### Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Invited to maintainer discussions
- Given appropriate repository permissions

## Questions?

- Open a discussion on GitHub
- Join our Discord community
- Check existing documentation
- Review closed issues and PRs
