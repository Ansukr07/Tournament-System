import io, { type Socket } from "socket.io-client"

let socket: Socket | null = null

export const initSocket = () => {
  if (socket) return socket

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://tournament-system-ou4e.onrender.com", {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  socket.on("connect", () => {
    console.log("[v0] Socket connected:", socket?.id)
  })

  return socket
}

export const getSocket = () => socket

export const emitEvent = (event: string, data: any) => {
  if (socket) {
    socket.emit(event, data)
  }
}

export const onEvent = (event: string, callback: (data: any) => void) => {
  if (socket) {
    socket.on(event, callback)
  }
}

export const offEvent = (event: string) => {
  if (socket) {
    socket.off(event)
  }
}
