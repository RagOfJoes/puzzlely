package puzzlely

import (
	"fmt"

	"github.com/spf13/cobra"
)

// Commands
var (
	rootCMD = &cobra.Command{
		Use:   "puzzlely [command]",
		Short: "Puzzlely's CLI tool",
		Long:  `Puzzlely is a game based on the BBC Game Show, "Only Connect".`,
		CompletionOptions: cobra.CompletionOptions{
			DisableDefaultCmd: true,
		},
		Run: func(cmd *cobra.Command, args []string) {
			if !cmd.HasSubCommands() {
				fmt.Print("Must provide a subcommand")
			}
		},
	}
	startCMD = &cobra.Command{
		Use:   "start",
		Short: "Start starts puzzlely's API web server ",
		Run: func(cmd *cobra.Command, args []string) {
			// Start()
			serve()
		},
	}
)

func init() {
	rootCMD.AddCommand(startCMD)
}

func Execute() error {
	return rootCMD.Execute()
}
