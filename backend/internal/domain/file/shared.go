package file

import "fmt"

func humanReadableSize(bytes int64) string {
	const (
		_          = iota
		kb float64 = 1 << (10 * iota)
		mb
		gb
	)

	switch {
	case float64(bytes) >= gb:
		return fmt.Sprintf("%.0f GB", float64(bytes)/gb)
	case float64(bytes) >= mb:
		return fmt.Sprintf("%.0f MB", float64(bytes)/mb)
	case float64(bytes) >= kb:
		return fmt.Sprintf("%.0f KB", float64(bytes)/kb)
	}
	return fmt.Sprintf("%.0f B", float64(bytes))
}
