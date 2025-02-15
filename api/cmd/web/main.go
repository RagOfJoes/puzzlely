package main

import (
	"log"
	"time"

	"github.com/RagOfJoes/puzzlely/internal/cmd/web"
)

func init() {
	// Set timezone to UTC
	time.Local = time.UTC
}

func main() {
	if err := web.Run(); err != nil {
		log.Fatal(err)
	}
}
