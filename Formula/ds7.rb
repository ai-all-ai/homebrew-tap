class Ds7 < Formula
  desc "Web architecture standard and quality gates for AI coding agents"
  homepage "https://github.com/ai-all-ai/ds7"
  url "https://registry.npmjs.org/@ai.all/ds7/-/ds7-2.5.0.tgz"
  sha256 "edbea32686200976e588b288381013074a50a093bcd7734b13cbdc1d6a04ea93"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "2.5.0", shell_output("#{bin}/ds7 --version")
  end
end
