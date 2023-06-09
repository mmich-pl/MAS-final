package errors

import "net/http"

type ApiError interface {
	Status() int
	Message() string
}

type apiError struct {
	status  int    `json:"status"`
	message string `json:"message"`
}

func (e *apiError) Status() int {
	return e.status
}

func (e *apiError) Message() string {
	return e.message
}

func NewInternalServerError(message string) ApiError {
	return &apiError{
		message: message,
		status:  http.StatusInternalServerError,
	}
}

func NewNotFoundError(message string) ApiError {
	return &apiError{
		message: message,
		status:  http.StatusNotFound,
	}
}

func NewBadRequest(message string) ApiError {
	return &apiError{
		message: message,
		status:  http.StatusBadRequest,
	}
}

func NewApiError(status int, message string) ApiError {
	return &apiError{
		message: message,
		status:  status,
	}
}
