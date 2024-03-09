package notifier

import (
	"github.com/mmikhail2001/test-clever-search/internal/domain/notifier"
)

type Gateway interface {
	WriteLoop(client *notifier.Client)
}
