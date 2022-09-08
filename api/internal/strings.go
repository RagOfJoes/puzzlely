package internal

import "strings"

// ToCamel converts string to camel case
func ToCamel(s string, initialCase bool) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return s
	}

	builder := strings.Builder{}
	builder.Grow(len(s))
	capNext := initialCase

	for i, v := range []byte(s) {
		isCap := v >= 'A' && v <= 'Z'
		isLow := v >= 'a' && v <= 'z'
		isNum := v >= '0' && v <= '9'

		if capNext {
			if isLow {
				v += 'A'
				v -= 'a'
			}
		} else if i == 0 {
			if isCap {
				v += 'a'
				v -= 'A'
			}
		}

		if isCap || isLow {
			builder.WriteByte(v)
			capNext = false
		} else if isNum {
			builder.WriteByte(v)
			capNext = true
		} else {
			capNext = v == '_' || v == ' ' || v == '-' || v == '.'
		}
	}

	return builder.String()
}
