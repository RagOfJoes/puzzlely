package web

import (
	"time"

	"github.com/RagOfJoes/puzzlely/internal/config"
	"github.com/sirupsen/logrus"
)

func SetupLogger(cfg config.Configuration) (func(), error) {
	// 1. Setup the Axiom hook for logrus
	// hook, err := adapter.New(
	// 	adapter.SetDataset(cfg.Telemetry.Dataset),
	// 	adapter.SetLevels(logrus.Level(cfg.Logger.Level)),
	// 	adapter.SetClientOptions(
	// 		axiom.SetNoEnv(),
	// 		axiom.SetAPITokenConfig(cfg.Telemetry.APIToken),
	// 	),
	// )
	// if err != nil {
	// 	return nil, err
	// }

	// 2. Register an exit handler to have all logs flushed before the
	// application exits in case of a "fatal" log operation
	// logrus.RegisterExitHandler(hook.Close)

	// 3. Configure the logger
	logrus.SetLevel(logrus.Level(cfg.Logger.Level))
	logrus.SetReportCaller(cfg.Logger.ReportCaller)
	logrus.SetFormatter(&logrus.TextFormatter{
		DisableTimestamp: false,
		DisableColors:    false,
		DisableQuote:     false,
		FullTimestamp:    true,
		TimestampFormat:  time.RFC3339,
	})

	// 4. Spawn the logger
	logger := logrus.New()

	// 5. Attach the Axiom hook
	// logger.AddHook(hook)

	// 6. Return a function that can be used to flush the logs
	return func() {
		logger.Info("Flushing logs...")

		// This makes sure logrus calls the registered exit handler. Alternaively
		// hook.Close() can be called manually. It is safe to call multiple times.
		//
		// ❗THIS IS IMPORTANT❗ Without it, the logs will not be sent to Axiom as
		// the buffer will not be flushed when the application exits.
		logrus.Exit(0)
	}, nil
}
