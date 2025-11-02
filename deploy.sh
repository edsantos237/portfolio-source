#!/bin/bash
set -e

# Paths
BUILD_DIR="/home/edsantos/Projects/Portfolio/portfolio-source"
PAGES_DIR="/home/edsantos/Projects/Portfolio/edsantos237.github.io"

# Commit message (default if none provided)
COMMIT_MSG=${1:-"Deploy latest React build"}

echo "🔧 Building React app..."
cd "$BUILD_DIR"
npm run build

echo "🧹 Cleaning old files in Pages repo..."
cd "$PAGES_DIR"
rm -rf ./*

echo "📦 Copying new build..."
cp -r "$BUILD_DIR/dist/"* "$PAGES_DIR/"

echo "🚀 Committing and pushing to GitHub..."
git add .
git commit -m "$COMMIT_MSG" || echo "No changes to commit."
git push

echo "✅ Deployment complete! Your site is live at: https://edsantos237.github.io"
