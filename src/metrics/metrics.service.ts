import {Injectable} from '@nestjs/common';
import {Series} from "./Series";
import {Player} from "../players/players.entity";
import {Team} from "../teams/teams.entity";
import {ConfigService} from "@nestjs/config";

const _ = require("lodash");

type XY = { x: number, y: number }

function arrayToXy([x, y]: [number, number]): XY {
    return {x, y}
}

interface Metrics {
    mouse: Series<{ button: string }>
    keyboard: Series<{ key: number }>
    move: Series<{ from: XY, to: XY, dist: number }>
}

function newMetrics(): Metrics {
    return {
        keyboard: new Series<{ key: number }>(),
        mouse: new Series<{ button: string }>(),
        move: new Series<{ from: XY; to: XY; dist: number }>()
    }
}

@Injectable()
export class MetricsService {

    private SECONDS_SAMPLE_SIZE!: number
    private MINUTES_SAMPLE_SIZE!: number

    constructor(private readonly config: ConfigService) {
        this.SECONDS_SAMPLE_SIZE = config.get('SECONDS_SAMPLE_SIZE', 2_000)
        this.MINUTES_SAMPLE_SIZE = config.get('MINUTES_SAMPLE_SIZE', 80_000)
    }

    displayMetrics(metrics: Metrics, divideBy: number | false = false): object {
        let stats = {
            'mouse_mean_1': metrics.mouse.meanCountAll(this.SECONDS_SAMPLE_SIZE, 1_000).toFixed(2),
            'keyboard_mean_1': metrics.keyboard.meanCountAll(this.SECONDS_SAMPLE_SIZE, 1_000).toFixed(2),
            'mouse_mean_60': metrics.mouse.meanCountAll(this.MINUTES_SAMPLE_SIZE, 60_000).toFixed(2),
            'keyboard_mean_60': metrics.keyboard.meanCountAll(this.MINUTES_SAMPLE_SIZE, 60_000).toFixed(2),
        }

        if (divideBy) {
            stats = {
                ...stats, ...{
                    'mouse_mean_1_avg': metrics.mouse.meanCountAllAcc(this.SECONDS_SAMPLE_SIZE, 1_000, divideBy).toFixed(3),
                    'keyboard_mean_1_avg': metrics.keyboard.meanCountAllAcc(this.SECONDS_SAMPLE_SIZE, 1_000, divideBy).toFixed(3),
                    'mouse_mean_60_avg': metrics.mouse.meanCountAllAcc(this.MINUTES_SAMPLE_SIZE, 60_000, divideBy).toFixed(3),
                    'keyboard_mean_60_avg': metrics.keyboard.meanCountAllAcc(this.MINUTES_SAMPLE_SIZE, 60_000, divideBy).toFixed(3),
                }
            }
        }

        return stats
    }

    private playerMetrics = new Map<number, Metrics>()
    private teamMetrics = new Map<number, Metrics>()
    private allMetrics = newMetrics()

    public getPlayerMetrics(playerId: number) {
        if (!this.playerMetrics.has(playerId)) {
            this.playerMetrics.set(playerId, newMetrics())
        }
        return this.playerMetrics.get(playerId)
    }

    public getTeamMetrics(teamId: number) {
        if (!this.teamMetrics.has(teamId)) {
            this.teamMetrics.set(teamId, newMetrics())
        }
        return this.teamMetrics.get(teamId)
    }

    public accumulate(playerId: number, teamId: number, metrics: { type: string, data: any }[]) {

        let series = this.getPlayerMetrics(playerId)
        let teamSeries = this.getTeamMetrics(teamId)

        for (let {type, data} of metrics) {
            switch (type) {
                case 'mouse_click':
                    let mouseData = {button: data['key']}
                    series.mouse.accumulate(mouseData)
                    teamSeries.mouse.accumulate(mouseData)
                    this.allMetrics.mouse.accumulate(mouseData)
                    break;
                case 'key':
                    let keyboardData = {key: data}
                    series.keyboard.accumulate(keyboardData)
                    teamSeries.keyboard.accumulate(keyboardData)
                    this.allMetrics.keyboard.accumulate(keyboardData)
                    break;
                case 'move':
                    let moveData = {from: arrayToXy(data.from), to: arrayToXy(data.to), dist: data.dist}
                    series.move.accumulate(moveData)
                    teamSeries.move.accumulate(moveData)
                    this.allMetrics.move.accumulate(moveData)
                    break;
            }
        }

        series.mouse.trim(120_000)
        series.keyboard.trim(120_000)
        series.move.trim(120_000)

        teamSeries.mouse.trim(120_000)
        teamSeries.keyboard.trim(120_000)
        teamSeries.move.trim(120_000)

        this.allMetrics.mouse.trim(120_000)
        this.allMetrics.keyboard.trim(120_000)
        this.allMetrics.move.trim(120_000)
    }

    public getData(
        players: Player[],
        teams: Team[]
    ) {
        let data = {
            players: {},
            teams: {},
            all: {}
        }

        let teamPlayers = {}
        for (let team of teams) {
            teamPlayers[Number(team.id)] = []
        }

        for (let player of players) {
            teamPlayers[Number(player.team)].push(player.id)
        }

        for (let player of players) {
            let playerId = player.id
            let metrics = this.getPlayerMetrics(playerId)
            data['players'][Number(playerId)] = this.displayMetrics(metrics)
        }

        for (let team of teams) {
            let teamId = team.id
            let metrics = this.getTeamMetrics(teamId)
            data['teams'][Number(teamId)] = this.displayMetrics(metrics, teamPlayers[Number(teamId)].length)
        }

        data['all'] = this.displayMetrics(this.allMetrics, players.length)

        return data

    }
}