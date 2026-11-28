class Ds7 < Formula
  desc "Web architecture standard and quality gates for AI coding agents"
  homepage "https://github.com/ai-all-ai/ds7"
  url "https://registry.npmjs.org/@ai.all/ds7/-/ds7-2.8.0.tgz"
  sha256 "79ad813f543b95181d7ff1874254e228e42386a6d98d18197512cbc1b7448831"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "2.8.0", shell_output("#{bin}/ds7 --version")
  end
end
