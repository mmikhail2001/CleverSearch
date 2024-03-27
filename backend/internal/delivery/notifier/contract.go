package notifier

import "github.com/WindowsKonon1337/CleverSearch/internal/domain/notifier"

type Usecase interface {
	Register(client *notifier.Client)
}
