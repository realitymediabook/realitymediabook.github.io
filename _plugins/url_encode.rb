# _plugins/url_encode.rb
require 'liquid'
require 'uri'

# Percent encoding for URI conforming to RFC 3986.
# Ref: http://tools.ietf.org/html/rfc3986#page-12
module URLEncode
  def url_encode(url)
    #    return URI.escape(url, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))
    return URI.encode_www_form_component(url)
  end
end

Liquid::Template.register_filter(URLEncode)