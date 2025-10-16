# GitHub Actions Workflows

## CI (ci.yml)
Runs on every push/PR to `main`:
- Install dependencies with Bun
- Run tests
- Type check

## Publish (publish.yml)
Automatically publishes to npm when a version tag is pushed:

```bash
# Example: Release v1.0.1
bun pm version patch          # Updates package.json to 1.0.1
git push && git push --tags   # Triggers auto-publish
```

### Setup NPM_TOKEN
1. Generate token: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Token type: **Automation** (for CI/CD)
3. Add to GitHub: Settings → Secrets → Actions → New secret
   - Name: `NPM_TOKEN`
   - Value: `npm_xxxxxxxxxxxx`

### Version Commands
```bash
bun pm version patch    # 1.0.0 → 1.0.1
bun pm version minor    # 1.0.0 → 1.1.0
bun pm version major    # 1.0.0 → 2.0.0
```
