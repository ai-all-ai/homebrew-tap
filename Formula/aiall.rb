class Aiall < Formula
  desc "Unified project instructions for AI coding agents"
  homepage "https://github.com/ai-all-ai/aiall"
  url "https://registry.npmjs.org/@ai.all/aiall/-/aiall-1.0.0.tgz"
  sha256 "9d1926ee67882261ed81f63d7d2e462308ba3db1f8b313d94f39d19953217f8a"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "1.0.0", shell_output("#{bin}/aiall --version")
  end
end
