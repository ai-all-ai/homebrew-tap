class Ds7 < Formula
  desc "Web architecture standard and quality gates for AI coding agents"
  homepage "https://github.com/ai-all-ai/ds7"
  url "https://registry.npmjs.org/@ai.all/ds7/-/ds7-2.1.0.tgz"
  sha256 "58e93ba42141a1a208d849787e6e61c82139a844529c4cef8d25199eb44bbf45"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "2.1.0", shell_output("#{bin}/ds7 --version")
  end
end
