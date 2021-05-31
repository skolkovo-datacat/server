import {Injectable} from "@nestjs/common";

const WebSocket = require('ws');
import {Player} from "../players/players.entity";

@Injectable()
export class WsStateService {

    // User id to socket
    private clientSockets = new Map<number, Set<WebSocket>>()
    // Vis
    private visSockets = new Set<WebSocket>()

    constructor() {
    }

    public addClientSocket(playerId: number, socket: WebSocket) {
        let playerSockets = this.getClientSockets(playerId)
        playerSockets.add(socket)
        this.clientSockets.set(playerId, playerSockets)
    }

    public removeClientSocket(playerId: number, socket: WebSocket) {
        if (!this.clientSockets.has(playerId)) {
            return
        }
        this.clientSockets.get(playerId).delete(socket)
    }

    public clearClientSockets(playerId: number) {
        if (!this.clientSockets.has(playerId)) {
            return
        }
        this.clientSockets.get(playerId).clear()
    }

    public getClientForSocket(socket: WebSocket): number | null {
        for (let [playerId, sockets] of this.clientSockets.entries()) {
            if (sockets.has(socket)) {
                return playerId
            }
        }
        return null
    }

    public getClientSockets(playerId: number): Set<WebSocket> {
        return this.clientSockets.get(playerId) || new Set<WebSocket>()
    }

    public addVisSocket(socket: WebSocket) {
        this.visSockets.add(socket)
    }

    public removeVisSocket(socket: WebSocket) {
        this.visSockets.delete(socket)
    }

    public getVisSockets() {
        return Array.from(this.visSockets)
    }
}