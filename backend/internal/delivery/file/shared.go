package file

import (
	"fmt"
	"strconv"
)

var defaultLimit int = 20

func setLimitOffset(value string) (int, error) {
	if value == "" {
		return defaultLimit, nil
	} else {
		valueInt, err := strconv.Atoi(value)
		if err != nil {
			return 0, fmt.Errorf("value is not integer: %w", err)
		} else {
			return valueInt, nil
		}
	}
}
