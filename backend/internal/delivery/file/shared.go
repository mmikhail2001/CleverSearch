package file

import (
	"context"
	"fmt"
	"strconv"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
)

// https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header

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

func setUserEmailToFile(ctx context.Context, file FileDTO) (FileDTO, error) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		return file, sharederrors.ErrUserNotFoundInContext
	}
	file.Email = user.Email
	return file, nil
}
