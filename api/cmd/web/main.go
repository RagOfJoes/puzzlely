package main

import (
	"log"

	"github.com/RagOfJoes/puzzlely/internal/cmd/web"
)

func main() {
	if err := web.Run(); err != nil {
		log.Fatal(err)
	}
}
