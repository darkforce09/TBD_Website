package services

import "strings"

// Snippet produces a short plain-ish preview from body content: it collapses
// whitespace and truncates to at most n runes (appending an ellipsis if cut).
func Snippet(body string, n int) string {
	collapsed := strings.Join(strings.Fields(body), " ")
	return truncate(collapsed, n)
}
