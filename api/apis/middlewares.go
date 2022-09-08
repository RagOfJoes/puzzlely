package apis

import (
	"net"
	"net/http"
	"time"

	"github.com/fatih/color"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/sirupsen/logrus"
)

// Logger defines the logger middleware
func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		defer func() {
			duration := color.New(color.FgGreen).Sprint(time.Since(start))
			method := color.New(color.FgMagenta, color.Bold).Sprintf(r.Method)
			size := color.New(color.FgBlue, color.Bold).Sprintf("%db", ww.BytesWritten())
			status := color.New(statusColor(ww.Status()), color.Bold).Sprint(ww.Status())
			requestID := color.New(color.FgYellow).Sprintf("[%s]", middleware.GetReqID(r.Context()))

			scheme := "http"
			if r.TLS != nil {
				scheme = "https"
			}
			url := color.New(color.FgCyan).Sprintf("\"%s://%s%s\"", scheme, r.Host, r.RequestURI)

			remoteIP, _, err := net.SplitHostPort(r.RemoteAddr)
			if err != nil {
				remoteIP = r.RemoteAddr
			}

			fields := logrus.Fields{
				"Proto":      r.Proto,
				"User-Agent": r.UserAgent(),
			}

			logrus.WithFields(fields).Infof("%s %s %s %s from %s in %s %s", requestID, method, status, url, remoteIP, duration, size)
		}()
		next.ServeHTTP(ww, r)
	})
}

// Generates a color based on HTTP status
func statusColor(status int) color.Attribute {
	switch {
	case status < 200:
		return color.FgBlue
	case status < 300:
		return color.FgGreen
	case status < 400:
		return color.FgCyan
	case status < 500:
		return color.FgYellow
	default:
		return color.FgRed
	}
}
