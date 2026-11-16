class Ds7 < Formula
  desc "Web architecture standard and quality gates for AI coding agents"
  homepage "https://github.com/ai-all-ai/ds7"
  url "https://registry.npmjs.org/@ai.all/ds7/-/ds7-2.2.0.tgz"
  sha256 "64fd05e5aea3ebd96a0a2c7a2e30be70f38a102ed70116a42c31e49085acb459"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "2.2.0", shell_output("#{bin}/ds7 --version")
  end
end
