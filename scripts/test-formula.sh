#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)"

# Accept optional formula path argument; derive formula name from basename
formula_path="${1:-$root/Formula/aiall.rb}"
formula_path="$(cd "$(dirname "$formula_path")" && pwd)/$(basename "$formula_path")"
formula_name="$(basename "$formula_path" .rb)"

ruby -c "$formula_path"
version="$(ruby "$root/scripts/formula-version.rb" "$formula_path")"

brew tap ai-all-ai/tap
tap_formula="$(brew --repository)/Library/Taps/ai-all-ai/homebrew-tap/Formula/${formula_name}.rb"
cp "$formula_path" "$tap_formula"
formula_ref="ai-all-ai/tap/${formula_name}"

brew audit --strict --online "$formula_ref"
brew install --build-from-source "$formula_ref"
brew test "$formula_ref"

installed_cli="$(brew --prefix "$formula_ref")/bin/${formula_name}"
actual_version=$("$installed_cli" --version)
if [[ "$actual_version" != "$version" ]]; then
  echo "Installed CLI version $actual_version does not match formula version $version" >&2
  exit 1
fi
echo "Homebrew formula and installed CLI both report version $version"
