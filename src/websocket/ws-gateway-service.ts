import {Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown} from "@nestjs/common";
import {WsStateService} from "./ws-state-service";

const WebSocket = require('ws');
import * as http from "http";
import * as url from "url";
import * as util from "util";
import {ConfigService} from "@nestjs/config";
import {encodePacket, parsePacket} from "./ws-util";
import {PlayersService} from "../players/players.service";
import {Player} from "../players/players.entity";
import {MetricsService} from "../metrics/metrics.service";
import {TeamsService} from "../teams/teams.service";
import {WsConnService} from "./ws-conn-service";
const _ = require( "lodash");

@Injectable()
export class WsGatewayService implements OnApplicationBootstrap, OnApplicationShutdown {

    private readonly logger = new Logger(WsGatewayService.name);

    private readonly httpServer = http.createServer()

    private readonly clientWss = new WebSocket.Server({noServer: true})
    private readonly visWss = new WebSocket.Server({noServer: true})

    constructor(
        private readonly stateService: WsStateService,
        private readonly config: ConfigService,
        private readonly playerService: PlayersService,
        private readonly metricsService: MetricsService,
        private readonly teamService: TeamsService,
        private readonly connService: WsConnService
    ) {
    }

    onApplicationBootstrap(): void {
        const logger = this.logger
        const clientWss = this.clientWss
        const visWss = this.visWss
        const httpServer = this.httpServer
        const stateService = this.stateService

        logger.log('Starting ws gateway')
        let port = this.config.get<string>('WS_PORT', '2800')

        clientWss.on('connection', ws => {
            let authorized = false
            let player: Player | null = null
            logger.debug('Incoming client connection', ws.url)

            ws.on('message', async (message) => {
                if (typeof message === 'string') {
                    let packet = parsePacket(message)

                    if (packet.type === 'auth') {
                        if (!authorized) {
                            let payload: { username: string } = packet.data

                            try {
                                player = await this.playerService.findOneByUsername(payload.username)
                                stateService.addClientSocket(player.id, ws)
                                authorized = true
                            } catch {
                                logger.warn('Disconnecting client: player not found')
                                ws.send('Error: player not found')
                                ws.close()
                            }
                        }
                    } else {
                        if (!authorized) {
                            ws.send('Error: not authorized')
                            ws.close()
                        } else {
                            if (packet.type === 'metrics') {
                                this.metricsService.accumulate(
                                    player.id,
                                    player.team.id,
                                    packet.data
                                )
                            }
                        }
                    }
                }
            });

            ws.on('close', async () => {
                let playerId = stateService.getClientForSocket(ws)
                if (playerId !== null) {
                    let player = await this.playerService.findOne(playerId)
                    stateService.removeClientSocket(player.id, ws)
                    logger.log(`Client disconnected: ${player.name}`)
                }
            })
        });

        visWss.on('connection', async ws => {
            this.logger.log('Incoming vis connection')
            stateService.addVisSocket(ws)
            await this.connService.triggerUpdate(true)
            ws.on('close', async () => {
                this.logger.log('Vis disconnected')
                stateService.removeVisSocket(ws)
            })
        })

        httpServer.on('upgrade', (request, socket, head) => {
            // logger.debug('Incoming websocket connection')
            const pathname = url.parse(request.url).pathname;

            if (pathname === '/client') {
                clientWss.handleUpgrade(request, socket, head, ws => {
                    clientWss.emit('connection', ws, request);
                });
            } else if (pathname === '/vis') {
                visWss.handleUpgrade(request, socket, head, ws => {
                    visWss.emit('connection', ws, request);
                })
            } else {
                socket.destroy();
            }
        });

        httpServer.listen(port, () => {
            logger.log(`Listening on :${port}`)
        });

        setInterval(async () => {

            let [players,teams] = await Promise.all([
                this.playerService.findAll(),
                this.teamService.findAll()
            ])

            let playersDB = _.keyBy(players, 'id')
            let teamsDB = _.keyBy(teams, 'id')

            let packet = encodePacket({
                type: 'metrics',
                data: {
                    'db': {
                        'teams': teamsDB,
                        'players': playersDB
                    },
                    'metrics': this.metricsService.getData(players, teams)
                }
            })

            for (let client of visWss.clients) {
                if (client.OPEN) {
                    client.send(packet)
                }
            }
        }, this.config.get<number>('PULSE_INTERVAL', 500))
    }

    async onApplicationShutdown(signal?: string): Promise<void> {
        this.logger.log('Shutting down ws gateway')

        await util.promisify(this.clientWss.close)().catch(e => this.logger.error(e))
        await util.promisify(this.httpServer.close)().catch(e => this.logger.error(e))
    }

}