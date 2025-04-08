# PortPilot Changelog

## v0.0.3 (2024-04-08)

### 🔧 Bug Fixes
- Fixed module compatibility issues between ESM and CJS
  - Added support for `.pilotrc.js` in ESM projects
  - Added support for `.pilotrc.cjs` in CJS projects
  - Fixed CLI execution in both module systems

### 🎨 Improvements
- Removed chalk dependency
  - Implemented custom terminal colorization utilities
  - Reduced external dependencies
  - Added direct ANSI color code handling

### 📝 Documentation
- Added configuration examples for both ESM and CJS
- Updated installation and usage instructions
- Added troubleshooting guide for module-related issues

### 🔄 Migration
Users should:
- ESM projects: Use `.pilotrc.js` with `export default`
- CJS projects: Use `.pilotrc.cjs` with `module.exports`