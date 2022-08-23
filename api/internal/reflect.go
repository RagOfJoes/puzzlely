package internal

import "reflect"

// Continually unwrap until we get the pointer's underlying value
func UnwrapReflectValue(rv reflect.Value) reflect.Value {
	cpy := reflect.Indirect(rv)
	for cpy.Kind() == reflect.Ptr {
		cpy = cpy.Elem()
	}

	return cpy
}

// Continually unwrap until we get the pointer's underlying value
func UnwrapReflectType(rt reflect.Type) reflect.Type {
	cpy := reflect.Indirect(reflect.New(rt)).Type()
	for cpy.Kind() == reflect.Ptr {
		cpy = cpy.Elem()
	}

	return cpy
}
