# Deployment Troubleshooting Guide

## Issue: has-symbols Package Resolution Error

### Problem
```
error: has-symbols@^1.0.3 failed to resolve
error: has-symbols@^1.1.0 failed to resolve
```

### Root Cause
This error typically occurs due to:
1. **Network Issues**: Temporary npm registry connectivity problems
2. **Lock File Conflicts**: Conflicts between npm and bun lock files
3. **Dependency Resolution**: Version conflicts in the dependency tree
4. **Registry Issues**: npm registry temporary outages

### Solutions

#### Solution 1: Use npm instead of bun (Recommended)
```bash
# Remove lock files to avoid conflicts
rm -f package-lock.json
rm -f bun.lockb

# Install with npm using legacy peer deps
npm install --legacy-peer-deps
```

#### Solution 2: Clear Cache and Retry
```bash
# Clear npm cache
npm cache clean --force

# Clear bun cache (if using bun)
bun pm cache rm

# Reinstall dependencies
npm install --legacy-peer-deps
```

#### Solution 3: Use Specific Registry
```bash
# Set npm registry explicitly
npm config set registry https://registry.npmjs.org/

# Install with retry mechanism
npm install --legacy-peer-deps --fetch-retries=5
```

#### Solution 4: Manual Resolution
If the issue persists, manually resolve the has-symbols dependency:

1. **Add to package.json**:
```json
{
  "overrides": {
    "has-symbols": "^1.0.3"
  },
  "resolutions": {
    "has-symbols": "^1.0.3"
  }
}
```

2. **Force install**:
```bash
npm install --force --legacy-peer-deps
```

### Render Deployment Configuration

#### render.yaml
```yaml
services:
  - type: web
    name: sbf-florist-frontend
    env: node
    buildCommand: |
      # Clear lock files
      rm -f package-lock.json
      rm -f bun.lockb
      
      # Install with npm
      npm install --legacy-peer-deps
      
      # Build
      npm run build:production
    startCommand: npm run preview
    envVars:
      - key: NODE_ENV
        value: production
      - key: NPM_CONFIG_REGISTRY
        value: https://registry.npmjs.org/
```

#### .npmrc
```
registry=https://registry.npmjs.org/
legacy-peer-deps=true
strict-ssl=false
fetch-retries=5
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
```

### Alternative Deployment Strategies

#### Strategy 1: Use npm instead of bun
- **Pros**: More stable, better compatibility
- **Cons**: Slightly slower installation
- **Command**: `npm install --legacy-peer-deps`

#### Strategy 2: Use yarn
- **Pros**: Better dependency resolution
- **Cons**: Additional tool dependency
- **Command**: `yarn install --ignore-engines`

#### Strategy 3: Pre-built deployment
- **Pros**: No dependency installation during deployment
- **Cons**: Larger repository size
- **Approach**: Commit `node_modules` (not recommended for production)

### Environment-Specific Solutions

#### Render.com
1. **Use render.yaml**: Configure build process explicitly
2. **Set Environment Variables**: Configure npm registry
3. **Use npm**: Switch from bun to npm for deployment

#### Vercel
1. **Use npm**: Set build command to use npm
2. **Clear Cache**: Use Vercel's cache clearing feature
3. **Override Dependencies**: Use package.json overrides

#### Netlify
1. **Build Command**: `npm install --legacy-peer-deps && npm run build`
2. **Node Version**: Specify Node.js version in package.json
3. **Cache**: Clear build cache if needed

### Prevention Measures

#### 1. Lock File Management
- **Use one package manager**: Stick to npm or yarn consistently
- **Remove conflicting locks**: Don't commit both package-lock.json and bun.lockb
- **Version control**: Commit lock files for reproducible builds

#### 2. Dependency Management
- **Regular updates**: Keep dependencies updated
- **Audit dependencies**: Run `npm audit` regularly
- **Use overrides**: Resolve conflicts with package.json overrides

#### 3. Build Optimization
- **Production builds**: Use production mode for deployment
- **Tree shaking**: Enable tree shaking in build process
- **Code splitting**: Implement proper code splitting

### Monitoring and Debugging

#### Build Logs
```bash
# Enable verbose logging
npm install --verbose

# Check dependency tree
npm ls has-symbols

# Audit dependencies
npm audit
```

#### Registry Status
- **Check npm status**: https://status.npmjs.org/
- **Alternative registries**: Use yarn or pnpm if npm is down
- **Mirror registries**: Configure npm to use mirrors

### Emergency Procedures

#### If deployment fails completely:
1. **Revert to last working commit**
2. **Use pre-built assets** (if available)
3. **Switch to alternative deployment platform**
4. **Contact support** with detailed error logs

#### Quick Fix Commands:
```bash
# Emergency npm install
npm install --force --legacy-peer-deps --no-optional

# Emergency build
npm run build -- --mode production

# Emergency cache clear
npm cache clean --force && rm -rf node_modules package-lock.json
```

### Success Indicators
- ✅ Dependencies install without errors
- ✅ Build process completes successfully
- ✅ Application starts without runtime errors
- ✅ Health checks pass
- ✅ Application responds to requests

### Common Error Messages and Solutions

| Error | Solution |
|-------|----------|
| `has-symbols failed to resolve` | Use npm with legacy peer deps |
| `Network timeout` | Increase fetch timeout, retry |
| `Peer dependency conflicts` | Use `--legacy-peer-deps` |
| `Registry 502 error` | Switch registry, retry later |
| `Lock file conflicts` | Remove lock files, reinstall |

### Contact Information
- **Render Support**: https://render.com/docs/help
- **npm Support**: https://docs.npmjs.com/getting-help
- **GitHub Issues**: Report issues in the repository

### Additional Resources
- [npm Troubleshooting Guide](https://docs.npmjs.com/troubleshooting)
- [Render Deployment Guide](https://render.com/docs/deploy-create-react-app)
- [Node.js Version Management](https://nodejs.org/en/download/) 