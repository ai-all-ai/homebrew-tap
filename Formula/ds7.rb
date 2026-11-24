class Ds7 < Formula
  desc "Web architecture standard and quality gates for AI coding agents"
  homepage "https://github.com/ai-all-ai/ds7"
  url "https://registry.npmjs.org/@ai.all/ds7/-/ds7-2.3.0.tgz"
  sha256 "46c855dd2031ab9873d859c5de7e6b970f11e176fe8ccc2d744667d15d17f8fa"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "2.3.0", shell_output("#{bin}/ds7 --version")
  end
end
