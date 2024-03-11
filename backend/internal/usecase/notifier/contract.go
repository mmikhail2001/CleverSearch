package notifier

import (
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/notifier"
)

type Gateway interface {
	WriteLoop(client *notifier.Client)
}
