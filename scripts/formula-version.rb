require "uri"

contents = File.read(ARGV.fetch(0))
url_lines = contents.scan(/^  url "([^"]+)"$/)
sha_lines = contents.scan(/^  sha256 "([0-9a-f]{64})"$/)
test_lines = contents.scan(/^    assert_match "([^"]+)", shell_output\("([^"]+)"\)$/)
abort "Expected one official npm URL" unless url_lines.length == 1
abort "Expected one SHA-256 checksum" unless sha_lines.length == 1
abort "Expected one CLI version assertion" unless test_lines.length == 1

url = URI(url_lines.fetch(0).fetch(0))
match = %r{\A/@ai\.all/aiall/-/aiall-(\d+\.\d+\.\d+)\.tgz\z}.match(url.path)
abort "Formula URL must use the official npm registry tarball" unless
  url.scheme == "https" && url.host == "registry.npmjs.org" && url.port == 443 && url.query.nil? && url.fragment.nil? && match
abort "Formula test must invoke the installed aiall CLI" unless test_lines.fetch(0).fetch(1) == '#{bin}/aiall --version'
abort "Formula URL version and CLI test version differ" unless match[1] == test_lines.fetch(0).fetch(0)
puts match[1]
