package notifier

type NotifyDTO struct {
	Event  string `json:"event"`
	UserID string `json:"user_id"`
	Path   string `json:"path"`
	Status string `json:"status"`
}
