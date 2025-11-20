import type { Server, Socket } from "socket.io"

export const setupSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id)

    socket.on("matchUpdated", (data) => {
      io.emit("matchUpdated", data)
    })

    socket.on("scoreSubmitted", (data) => {
      io.emit("leaderboardUpdated", data)
    })

    socket.on("scheduleChanged", (data) => {
      io.emit("scheduleChanged", data)
    })

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)
    })
  })
}
