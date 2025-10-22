import { useEffect, useRef } from "react";
import { useAuth } from "./use-auth";
import { queryClient } from "@/lib/queryClient";

export function useWebSocket() {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Authenticate with user ID
      ws.send(JSON.stringify({
        type: "auth",
        userId: user.id,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "balance_update") {
          // Update user balance in cache
          queryClient.setQueryData(["/api/user"], (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              balance: data.balance,
            };
          });

          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
          queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    wsRef.current = ws;

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  return wsRef.current;
}
