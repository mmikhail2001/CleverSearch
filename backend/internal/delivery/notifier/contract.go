package notifier

import "github.com/mmikhail2001/test-clever-search/internal/domain/notifier"

type Usecase interface {
	Register(client *notifier.Client)
}
