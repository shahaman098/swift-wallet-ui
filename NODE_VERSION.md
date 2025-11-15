# Node.js Version Requirements

## Required Version
**Node.js 18 or higher**

## Recommended Version
**Node.js 18.x LTS** or **Node.js 20.x LTS**

## Why Node 18+?
- Backend uses modern TypeScript features requiring Node 18+
- Frontend uses Vite 5 which works best with Node 18+
- All dependencies are compatible with Node 18+

## Check Your Version
```bash
node --version
```

Should show: `v18.x.x` or higher

## Install Node.js
- **Windows/Mac/Linux**: Download from https://nodejs.org/
- **Using nvm** (recommended):
  ```bash
  nvm install 18
  nvm use 18
  ```

## Version Files
- `.nvmrc` - For nvm users (Node 18)
- `.node-version` - For asdf users (Node 18)

## Backend vs Frontend
- **Backend**: Uses `@types/node ^20.10.5` but works with Node 18+
- **Frontend**: Uses `@types/node ^22.16.5` but works with Node 18+

Both are compatible with Node 18+, which is the minimum requirement.

