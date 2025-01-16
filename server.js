const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = express()
    const httpServer = http.createServer(server)
    const io = socketIo(httpServer)


    server.get('*', (req, res) => {
        return handle(req, res)
    })

    io.on('connection', (socket) => {
        console.log('a user has joined!')
        socket.on('disconnect', () => {
            console.log('user has disconnected')
        })

        socket.on('chat message', (msg) => {
            io.emit('chat message', msg)
        })
    })

    httpServer.listen(3000, () => {
        console.log('listening p3000')
    })
})