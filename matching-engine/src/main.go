package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Health struct {
	Service string `json:"service"`
	Mode    string `json:"mode"`
}

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(Health{Service: "C Trader paper matching engine", Mode: "simulation-only"})
	})
	log.Println("Paper matching-engine scaffold listening on :9090")
	log.Fatal(http.ListenAndServe(":9090", nil))
}
