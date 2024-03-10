package shared

type UserContextType string

var UserContextName UserContextType = "user"
var CookieName string = "session_id"

type Response struct {
	Status int         `json:"status"`
	Body   interface{} `json:"body"`
}
