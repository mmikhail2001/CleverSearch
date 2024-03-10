package file

import (
	"fmt"
	"strconv"
)

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
