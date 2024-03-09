package notifier

type NotifyDTO struct {
	Event  string `json:"event"`
	UserID string `json:"user_id"`
	S3URL  string `json:"url_s3"`
}
