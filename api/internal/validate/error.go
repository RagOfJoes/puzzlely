package validate

import (
	"fmt"
	"reflect"
	"strings"
)

var (
	tagTypes map[string][]string = map[string][]string{
		// Format tags
		"format": {"cidr", "cidrv4", "cidrv6", "datauri", "fqdn", "hostname", "hostname_port", "hostname_rfc1123", "tcp_addr", "tcp4_addr", "tcp6_addr", "udp_addr", "udp4_addr", "udp6_addr", "ip_addr", "ip4_addr", "ip6_addr", "ip", "ipv4", "ipv6", "unix_addr", "mac", "uri", "url", "url_encoded", "urn_rfc2141", "alpha", "alphanum", "alphanumspace", "alphaunicode", "alphanumunicode", "ascii", "lowercase", "multibyte", "number", "numeric", "printascii", "printasciiextra", "uppercase", "base64", "base64url", "btc_addr", "btc_addr_bech32", "datetime", "e164", "email", "eth_addr", "hexadecimal", "hexcolor", "hsl", "hsla", "html", "html_encoded", "isbn", "isbn10", "isbn13", "json", "latitude", "longitude", "rgb", "rgba", "ssn", "uuid", "uuid_rfc4122", "uuid3", "uuid3_rfc4122", "uuid4", "uuid4_rfc4122", "uuid5", "uuid5_rfc4122", "dir", "file", "isdefault", "unique"},
		// Comparison tags
		"comparison": {"eqcsfield", "eqfield", "containsfield", "excludesfield", "gtcsfield", "gtecsfield", "gtefield", "gtfield", "ltcsfield", "ltecsfield", "ltefield", "ltfield", "necsfield", "nefield", "eq", "gt", "gte", "lt", "lte", "ne", "len", "min", "max", "oneof", "excludes", "excludesall", "excludesrune", "contains", "containsany", "containsrune", "startswith", "endswith"},
	}
	// Message templates for string related
	// validator fields
	stringTemplates map[string]string = map[string]string{
		"len": "must be",
		"gt":  "must be more than",
		"gte": "must be more than or equal to",
		"lt":  "must be less than",
		"lte": "must be less than or equal to",
		"max": "must be less than or equal to",
		"min": "must be more than or equal to",
	}
	// Message templates for most validator
	// fields
	templates map[string]string = map[string]string{
		// Field
		//
		"eqcsfield":     "must be equal to",
		"eqfield":       "must be equal to",
		"containsfield": "must contain",
		"excludesfield": "must not contain",
		"gtcsfield":     "must be greater than",
		"gtecsfield":    "must be greater than or equal to",
		"gtefield":      "must be greater than or equal to",
		"gtfield":       "must be greater than",
		"ltcsfield":     "must be less than",
		"ltecsfield":    "must be less than or equal to",
		"ltefield":      "must be less than or equal to",
		"ltfield":       "must be less than",
		"necsfield":     "must not be equal to",
		"nefield":       "must not be equal to",
		// Network
		//
		"cidr":             "must be a valid CIDR address",
		"cidrv4":           "must be a valid v4 CIDR address",
		"cidrv6":           "must be a valid v6 CIDR address",
		"datauri":          "must be a valid DataURI",
		"fqdn":             "must be a valid FQDN",
		"hostname":         "must be a valid Hostname(RFC 952)",
		"hostname_port":    "must be a valid DNS Hostname and Port",
		"hostname_rfc1123": "must be a valid Hostname(RFC 1123)",
		"tcp_addr":         "must be a valid resolvable TCP address",
		"tcp4_addr":        "must be a valid resolvable TCPv4 address",
		"tcp6_addr":        "must be a valid resolvable TCPv6 address",
		"udp_addr":         "must be a valid resolvable UDP address",
		"udp4_addr":        "must be a valid resolvable UDPv4 address",
		"udp6_addr":        "must be a valid resolvable UDPv6 address",
		"ip_addr":          "must be a valid resolvable IP address",
		"ip4_addr":         "must be a valid resolvable IPv4 address",
		"ip6_addr":         "must be a valid resolvable IPv6 address",
		"ip":               "must be a valid resolvable IP address",
		"ipv4":             "must be a valid resolvable IPv4 address",
		"ipv6":             "must be a valid resolvable IPv6 address",
		"unix_addr":        "must be a valid Unix address",
		"mac":              "must be a valid MAC address",
		"uri":              "must be a valid URI",
		"url":              "must be a valid URL",
		"url_encoded":      "must be a valid percent encoded URL",
		"urn_rfc2141":      "must be a valid URN(RFC 2141)",
		// Strings
		//
		"alpha":           "must only contain letters",
		"alphanum":        "must only contain letters and numbers",
		"alphaunicode":    "must contain unicode alpha characters only",
		"alphanumunicode": "must contain unicode alphanumeric characters only",
		"ascii":           "must contain ASCII characters only",
		"contains":        "must contain:",
		"containsany":     "must contain one of:",
		"containsrune":    "must contain:",
		"endswith":        "must end with:",
		"lowercase":       "must contain lowercase characters only",
		"multibyte":       "must contain one or more multibyte characters",
		"number":          "must contain numbers only",
		"numeric":         "must contain numeric values only",
		"printascii":      "must contain printable ASCII characters only",
		"printasciiextra": "must contain printable ASCII, carriage return, and newline characters only",
		"startswith":      "must start with:",
		"uppercase":       "must contain uppercase characters only",
		// Format
		//
		"base64":          "must be a valid Base64",
		"base64url":       "must be a valid Bas64URL",
		"btc_addr":        "must be a valid Bitcoin address",
		"btc_addr_bech32": "must be a valid Bitcoin Bech32 address",
		"datetime":        "must be a valid Datetime value",
		"e164":            "must be a valid E164 formatted phone number",
		"email":           "must be a valid Email address",
		"eth_addr":        "must be a valid Ethereum address",
		"hexadecimal":     "must be a valid Hexadecimal",
		"hexcolor":        "must be a valid Hexcolor",
		"hsl":             "must be a valid HSL",
		"hsla":            "must be a valid HSLA",
		"html":            "must be a valid HTML element",
		"html_encoded":    "must be a valid encoded HTML value",
		"isbn":            "must be a valid ISBN",
		"isbn10":          "must be a valid ISBN10",
		"isbn13":          "must be a valid ISBN13",
		"json":            "must be a valid JSON",
		"latitude":        "must be a valid Latitude value",
		"longitude":       "must be a valid Longitude value",
		"rgb":             "must be a valid RGB value",
		"rgba":            "must be a valid RGBA value",
		"ssn":             "must be a valid SSN",
		"uuid":            "must be a valid UUID",
		"uuid_rfc4122":    "must be a valid UUID(RFC 4122)",
		"uuid3":           "must be a valid UUID v3",
		"uuid3_rfc4122":   "must be a valid UUID v3(RFC 4122)",
		"uuid4":           "must be a valid UUID v4",
		"uuid4_rfc4122":   "must be a valid UUID v4(RFC 4122)",
		"uuid5":           "must be a valid UUID v5",
		"uuid5_rfc4122":   "must be a valid UUID v5(RFC 4122)",
		// Comparison
		//
		"eq":  "must be equal to",
		"gt":  "must be greater than",
		"gte": "must be greater than or equal to",
		"lt":  "must be less than",
		"lte": "must be less than or equal to",
		"ne":  "must not be equal to",
		// Other
		//
		"dir":                  "must be a valid resolvable Directory",
		"excludes":             "must not contain",
		"excludesall":          "must not contain",
		"excludesrune":         "must not contain",
		"file":                 "must be a valid resolvable File path",
		"isdefault":            "must contain default values only",
		"len":                  "must have the length of",
		"max":                  "must not be greater than",
		"min":                  "must not be less than",
		"oneof":                "must be one of",
		"required":             "must not be blank",
		"required_if":          "must not be blank",
		"required_unless":      "must not be blank",
		"required_with":        "must not be blank",
		"required_with_all":    "must not be blank",
		"required_without":     "must not be blank",
		"required_without_all": "must not be blank",
		"unique":               "must contain only unique values",
		// Custom
		//
		"notblank":      "must not be blank",
		"alphanumspace": "must only contain letters, numbers, '-', '_', and spaces",
	}
)

type FormatError struct {
	TagName  string       `json:"-"`
	TagParam string       `json:"-"`
	Kind     reflect.Kind `json:"-"`
	Field    string       `json:"field"`
}

func NewFormatError(kind reflect.Kind, field string, tag string, param string) error {
	return &FormatError{
		Kind:     kind,
		Field:    field,
		TagName:  tag,
		TagParam: param,
	}
}
func (e *FormatError) Code() string {
	for k, v := range tagTypes {
		for _, s := range v {
			if s == e.TagName {
				return k
			}
		}
	}
	return "validation"
}
func (e *FormatError) Error() string {
	for k, v := range templates {
		if k == e.TagName {
			template := v
			code := e.Code()
			if code != "validation" {
				switch code {
				case "format":
					return fmt.Sprintf("%s %s.", e.Field, template)
				case "comparison":
					if e.TagName == "oneof" {
						return fmt.Sprintf("%s %s %s.", e.Field, template, strings.Join(strings.Split(e.TagParam, " "), ", "))
					}
					if e.Kind == reflect.String && stringTemplates[e.TagName] != "" {
						char := "characters"
						if e.TagParam == "1" {
							char = "character"
						}
						return fmt.Sprintf("%s %s %s %s long.", e.Field, stringTemplates[e.TagName], e.TagParam, char)
					}
					return fmt.Sprintf("%s %s %s.", e.Field, template, e.TagParam)
				}
			}
			return fmt.Sprintf("%s %s.", e.Field, template)
		}
	}
	return fmt.Sprintf("Invalid %s value provided.", e.Field)
}
