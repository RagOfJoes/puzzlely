package main

import (
	"fmt"
	"os"

	"github.com/RagOfJoes/puzzlely/cmd/puzzlely"
)

func main() {
	if err := puzzlely.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
