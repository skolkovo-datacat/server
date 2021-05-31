import {forwardRef, Inject, Injectable, Logger} from "@nestjs/common";
import {WsStateService} from "./ws-state-service";
import {Widget} from "../widgets/widgets.entity";
import {encodePacket} from "./ws-util";
import {WidgetsService} from "../widgets/widgets.service";
import {BroadcastsService} from "../broadcast/broadcasts.service";

@Injectable()
export class WsConnService {

    private readonly logger = new Logger(WsConnService.name);

    constructor(
        private readonly stateService: WsStateService,
        @Inject(forwardRef(() => WidgetsService))
        private readonly widgetService: WidgetsService,
        @Inject(forwardRef(() => BroadcastsService))
        private readonly broadcastService: BroadcastsService
    ) {
    }

    public terminateClient(playerId: number) {
        try {
            let sockets = this.stateService.getClientSockets(playerId)
            for (let socket of sockets) {
                socket.send('Error: player removed')
                socket.close()
            }
            this.stateService.clearClientSockets(playerId)
        } catch (e) {
            this.logger.error(e)
        }
    }

    public async triggerUpdate(force: boolean = false) {
        if (!(force || await this.broadcastService.isActiveSingular())) {
            return;
        }

        await this.syncVisQueue()
    }

    private async syncVisQueue() {
        try {
            let widgets = await this.widgetService.findAll(1)
            let sockets = this.stateService.getVisSockets()

            let message = encodePacket({
                type: 'widgets',
                data: widgets.map(w => {
                    let data = JSON.parse(w.data)

                    let x = data['x']
                    let y = data['y']
                    delete data['x']
                    delete data['y']

                    return ({
                        name: w.type,
                        id: w.id,
                        config: {
                            x, y,
                            startISO: w.start_time.toISOString(),
                            durationMs: w.duration,
                            params: data
                        }
                    });
                })
            })

            this.logger.debug(`Synchronising vis queue: ${message}`)

            for (let socket of sockets) {
                if (socket.OPEN) {
                    socket.send(message)
                }
            }
        } catch (e) {
            this.logger.error(e)
        }
    }

}