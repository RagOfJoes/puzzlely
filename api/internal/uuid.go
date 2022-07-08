package internal

import "github.com/google/uuid"

// IsUniqueUUIDSlice checks if a slice of uuid only contain unique values
func IsUniqueUUIDSlice(slice []uuid.UUID) bool {
	m := map[uuid.UUID]bool{}
	for _, i := range slice {
		if m[i] {
			return false
		}
		m[i] = true
	}
	return true
}

// IsUUIDEvery checks if elements in b are in a
func IsUUIDEvery(a []uuid.UUID, b []uuid.UUID) bool {
	ids := map[uuid.UUID]bool{}
	for _, id := range a {
		if !ids[id] {
			ids[id] = true
		}
	}
	for _, id := range b {
		if !ids[id] {
			return false
		}
	}
	return true
}
