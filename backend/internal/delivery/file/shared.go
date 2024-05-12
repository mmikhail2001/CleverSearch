package file

import (
	"fmt"
	"strconv"
	"strings"
)

// https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header

func getFileExtension(filename string) string {
	parts := strings.Split(filename, ".")
	if len(parts) > 1 {
		return parts[len(parts)-1]
	}
	return ""
}

func setLimitOffset(value string, defaultValue int) (int, error) {
	if value == "" {
		return defaultValue, nil
	} else {
		valueInt, err := strconv.Atoi(value)
		if err != nil {
			return 0, fmt.Errorf("limit or offset is not integer: %w", err)
		} else {
			return valueInt, nil
		}
	}
}
