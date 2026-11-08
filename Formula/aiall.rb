
class Aiall < Formula
  desc "Unified project instructions for AI coding agents"
  homepage "https://github.com/ai-all-ai/aiall"
  url "https://registry.npmjs.org/@ai.all/aiall/-/aiall-0.2.0.tgz"
  sha256 "PASTE_REAL_SHA256_HERE"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "0.2.0", shell_output("#{bin}/aiall --version")
  end
end
