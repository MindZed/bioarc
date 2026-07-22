// lib/hooks/useWebSocket.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

const WS_URL = process.env.NEXT_PUBLIC_GO_WS_URL || "ws://droplet.sewen.me:8080/ws";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function connect() {
      try {
        console.log("[WebSocket] Connecting to Go Backend:", WS_URL);
        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log("[WebSocket] Connected successfully!");
          setIsConnected(true);
          useStore.getState().setWsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("[WebSocket] Live Telemetry Packet Received:", data);
            useStore.getState().handleLiveTelemetry(data);
          } catch (err) {
            console.error("[WebSocket] Failed to parse JSON message:", err);
          }
        };

        socket.onerror = (error) => {
          console.warn("[WebSocket] Error encountered:", error);
        };

        socket.onclose = () => {
          console.warn("[WebSocket] Connection closed. Reconnecting in 3s...");
          setIsConnected(false);
          useStore.getState().setWsConnected(false);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };
      } catch (err) {
        console.error("[WebSocket] Connection attempt failed:", err);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      }
    }

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return { isConnected };
}
