const millis = Date.now
const _ = require('lodash')

export class Series<D extends object> {

    /*Date - value*/
    private buffer: { instant: number, value: D }[] = []

    private getTrimmedBuffer(maxAge: number) {
        let i = 0
        const MIN_INSTANT = millis() - maxAge
        for (; i < this.buffer.length; i++) {
            if (this.buffer[i].instant > MIN_INSTANT) {
                break
            }
        }
        return this.buffer.slice(i) || []
    }

    public trim(maxAge: number): this {
        this.buffer = this.getTrimmedBuffer(maxAge)
        return this
    }

    public accumulate(value: D) {
        this.buffer.push({instant: millis(), value})
    }

    public meanCountAll(sampleSize: number, duration: number) {
        const sampleBuffer = this.getTrimmedBuffer(sampleSize)

        if (sampleBuffer.length < 2) {
            return sampleBuffer.length
        }

        const start = _.head(sampleBuffer).instant
        const end = _.last(sampleBuffer).instant
        let correctedSampleLength = (end - start) / 1000

        if (correctedSampleLength < 1) {
            correctedSampleLength = 1
        }

        const sampleCount = sampleBuffer.length

        const perSecond = sampleCount / correctedSampleLength
        return perSecond * duration / 1000
    }

    public meanCountAllAcc(sampleSize: number, duration: number, divideBy: number) {
        return this.meanCountAll(sampleSize, duration) / divideBy
    }

}