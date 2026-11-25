class Ds7 < Formula
  desc "Web architecture standard and quality gates for AI coding agents"
  homepage "https://github.com/ai-all-ai/ds7"
  url "https://registry.npmjs.org/@ai.all/ds7/-/ds7-2.4.0.tgz"
  sha256 "5a9a632072f0032de161dc561e176bdeddca0f5825f7e171482c7743060af5ea"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "2.4.0", shell_output("#{bin}/ds7 --version")
  end
end
