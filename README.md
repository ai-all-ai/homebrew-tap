# homebrew-tap

Official Homebrew tap for AI-ALL and DS7 CLI tools.

## Install and upgrade

```bash
brew tap ai-all-ai/tap
brew install aiall
brew install ds7
```

To upgrade an existing installation after a formula update is merged:

```bash
brew update
brew upgrade aiall ds7
```

The formulas install the published `@ai.all/aiall` and `@ai.all/ds7` npm packages and require Node.js.

## Formula updates

The `Update Homebrew formula` workflow checks the npm registry every six hours and can also be started manually from **Actions → Update Homebrew formula → Run workflow** on `main`, for one formula or, with the input left empty, for both.

For each formula (`aiall` and `ds7`), the workflow reads the package's stable `latest` metadata from the npm registry API, validates the package/version/tarball URL, downloads the published archive, checks the registry SHA-512 integrity, and computes SHA-256 itself. It ignores prereleases, does nothing when the version is unchanged, and refuses to downgrade the formula. When a newer stable version is published, it changes only that package's `Formula/<name>.rb`, then runs Ruby syntax validation, `brew audit`, installation, and `brew test` before opening or updating a version-specific PR. Its commits and PR titles use `chore(<formula>): update formula to <version>`. It never writes directly to `main` or auto-merges.

The formula version always follows the npm `latest` tag: a new AI-ALL or DS7 release gets an update PR within about six hours of its npm publication and reaches this tap once the PR is merged. Publish to npm first; the formula cannot update before npm has the version.

Review the PR diff and its **Checks** before merging. The updater uses the repository's least-privilege `GITHUB_TOKEN`. GitHub does not automatically start new workflows for PRs created using that token; the updater therefore runs formula validation before opening the PR. To run the PR workflow explicitly, open **Actions → Test Homebrew formula → Run workflow** and select the PR branch.

If a scheduled run reports that npm metadata or the tarball is not yet available, no PR is opened; retry with **Run workflow** or wait for the next six-hour check. For audit, install, or test failures, inspect the failed Actions step, fix the formula or release issue, then rerun the workflow. The updater cannot publish npm versions; publish and verify the npm package first.

## Local checks

```bash
node --test
npx --yes prettier@3.6.2 --check "**/*.{js,mjs,cjs,json,yml,yaml}"
ruby -c Formula/aiall.rb
ruby -c Formula/ds7.rb
bash scripts/test-formula.sh Formula/aiall.rb
bash scripts/test-formula.sh Formula/ds7.rb
```

`scripts/test-formula.sh` runs Homebrew audit, installation, formula tests, and an explicit installed CLI version comparison on Linux or macOS with Homebrew available. CI runs it on Linux runners.
