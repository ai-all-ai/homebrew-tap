# homebrew-tap

Official Homebrew tap for AI-ALL CLI.

## Install and upgrade

```bash
brew tap ai-all-ai/tap
brew install aiall
```

To upgrade an existing installation after a formula update is merged:

```bash
brew update
brew upgrade aiall
```

The formula installs the published `@ai.all/aiall` npm package and requires Node.js.

## Formula updates

The `Update Homebrew formula` workflow checks the npm registry every six hours and can also be started manually from **Actions → Update Homebrew formula → Run workflow** on `main`.

The workflow reads the package's stable `latest` metadata from the npm registry API, validates the package/version/tarball URL, downloads the published archive, checks the registry SHA-512 integrity, and computes SHA-256 itself. It ignores prereleases, does nothing when the version is unchanged, and refuses to downgrade the formula. When a newer stable version is published, it changes only `Formula/aiall.rb`, then runs Ruby syntax validation, `brew audit`, installation, and `brew test` before opening or updating a version-specific PR. It never writes directly to `main` or auto-merges.

Review the PR diff and its **Checks** before merging. The updater uses the repository's least-privilege `GITHUB_TOKEN`. GitHub does not automatically start new workflows for PRs created using that token; the updater therefore runs formula validation before opening the PR. To run the PR workflow explicitly, open **Actions → Test Homebrew formula → Run workflow** and select the PR branch.

If a scheduled run reports that npm metadata or the tarball is not yet available, no PR is opened; retry with **Run workflow** or wait for the next six-hour check. For audit, install, or test failures, inspect the failed Actions step, fix the formula or release issue, then rerun the workflow. The updater cannot publish npm versions; publish and verify the npm package first.

## Local checks

```bash
node --test
ruby -c Formula/aiall.rb
bash scripts/test-formula.sh
```

`scripts/test-formula.sh` runs Homebrew audit, installation, formula tests, and an explicit installed CLI version comparison on macOS with Homebrew available.
