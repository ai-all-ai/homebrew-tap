#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
formula="${1:-$root/Formula/aiall.rb}"
formula="$(cd "$(dirname "$formula")" && pwd)/$(basename "$formula")"

ruby -c "$formula"
version="$(ruby "$root/scripts/formula-version.rb" "$formula")"

brew tap ai-all-ai/homebrew-tap
tap_formula="$(brew --repository)/Library/Taps/ai-all-ai/homebrew-tap/Formula/aiall.rb"
cp "$formula" "$tap_formula"
formula_ref="ai-all-ai/homebrew-tap/aiall"

brew audit --strict --online "$formula_ref"
brew install --build-from-source "$formula_ref"
brew test "$formula_ref"

installed_cli="$(brew --prefix "$formula_ref")/bin/aiall"
actual_version=$("$installed_cli" --version)
if [[ "$actual_version" != "$version" ]]; then
  echo "Installed CLI version $actual_version does not match formula version $version" >&2
  exit 1
fi
echo "Homebrew formula and installed CLI both report version $version"
