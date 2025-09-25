# Working with the PODY Language Server Submodule

This repository includes the PODY Language Server as a Git submodule. Here's how to work with it:

## 🚀 Initial Setup (For New Clones)

When someone clones this repository for the first time, they need to initialize the submodules:

```bash
# Clone the main repository
git clone https://github.com/HrithikMani/herbie.git
cd herbie

# Initialize and update submodules
git submodule init
git submodule update

# Or do it in one step:
git clone --recursive https://github.com/HrithikMani/herbie.git
```

## 🔄 Updating the Submodule

To pull the latest changes from the PODY Language Server:

```bash
# Method 1: Update to latest commit
cd pody-language-server
git pull origin main
cd ..
git add pody-language-server
git commit -m "Update pody-language-server submodule"

# Method 2: Update all submodules at once
git submodule update --remote
git add pody-language-server
git commit -m "Update pody-language-server submodule"
```

## 🛠️ Making Changes to the Submodule

If you need to make changes to the PODY Language Server:

```bash
# 1. Go into the submodule directory
cd pody-language-server

# 2. Create a new branch for your changes
git checkout -b feature/your-feature-name

# 3. Make your changes and commit them
git add .
git commit -m "Your changes"

# 4. Push to the submodule repository
git push origin feature/your-feature-name

# 5. Go back to main repository and update the submodule reference
cd ..
git add pody-language-server
git commit -m "Update pody-language-server with new changes"
```

## 📦 Installing the PODY Language Server

To install the VS Code extension:

```bash
cd pody-language-server
./install.sh
```

## 🗂️ Submodule Structure

```
herbie_extension/
├── pody-language-server/     # Git submodule → https://github.com/HrithikMani/pody-lsp.git
│   ├── src/
│   ├── syntaxes/
│   ├── package.json
│   ├── install.sh
│   └── ...
├── sample.pody              # Example PODY file
├── test.pody               # Test PODY file
└── ...
```

## 🔗 Related Repositories

- **Main Repository**: https://github.com/HrithikMani/herbie
- **PODY Language Server**: https://github.com/HrithikMani/pody-lsp

## 🆘 Common Issues

### Issue: Submodule appears as modified but no changes made
```bash
# Reset the submodule to its committed state
git submodule update --init pody-language-server
```

### Issue: Submodule directory is empty after clone
```bash
# Initialize and update submodules
git submodule init
git submodule update
```

### Issue: Want to remove the submodule
```bash
# Remove from .gitmodules
git submodule deinit pody-language-server

# Remove from git index
git rm pody-language-server

# Commit the changes
git commit -m "Remove pody-language-server submodule"
```