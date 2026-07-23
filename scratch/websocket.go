package ws

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

var (
	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.Mutex
)

// WsHandler upgrades the HTTP connection and adds the client to the registry
func WsHandler(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}

	clientsMu.Lock()
	clients[conn] = true
	clientsMu.Unlock()

	log.Println("New WebSocket client connected.")

	// Keep connection alive and handle disconnects
	go func() {
		defer func() {
			clientsMu.Lock()
			delete(clients, conn)
			clientsMu.Unlock()
			conn.Close()
			log.Println("WebSocket client disconnected.")
		}()
		for {
			// Read messages just to catch client disconnections
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()
}

// BroadcastMessage sends a JSON message to all connected WebSocket clients
func BroadcastMessage(msgType string, payload interface{}) {
	message := map[string]interface{}{
		"type":    msgType,
		"payload": payload,
	}

	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {
		err := client.WriteJSON(message)
		if err != nil {
			log.Println("WebSocket error writing to client:", err)
			client.Close()
			delete(clients, client)
		}
	}
}
