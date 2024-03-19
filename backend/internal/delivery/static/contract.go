package static

import (
	"context"
)

type Usecase interface {
	AddSheringGrant(ctx context.Context, dir string) error
}
