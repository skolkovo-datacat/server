export interface Packet {
    type: string,
    data: any
}

export function parsePacket(data: string): Packet {
    return <Packet>JSON.parse(data)
}

export function encodePacket(data: Packet): string {
    return JSON.stringify(data)
}