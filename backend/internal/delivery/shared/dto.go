package shared

type UserContextType string

var UserContextName UserContextType = "user"
var CookieName string = "session_id"

type Response struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Body    interface{} `json:"body"`
}

func NewResponse(status int, message string, body interface{}) Response {
	return Response{
		Status:  status,
		Message: message,
		Body:    body,
	}
}
