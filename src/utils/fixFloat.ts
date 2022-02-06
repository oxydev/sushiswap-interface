import Decimal from 'decimal.js'

export default function fixFloat(handle: Number, fixto: number, intlen = 4): String {
    const temp = handle.toFixed(fixto)
    const i = temp.indexOf('.')
    if (i <= intlen) {
        return temp
    } else {
        return handle.toFixed(fixto - (i - intlen) > 0 ? fixto - (i - intlen) : 0)
    }
}

export function fixFloatFloor(handle: Number, fixto: number): String {
    const m = Math.pow(10, fixto)
    const re = Math.floor(handle.valueOf() * m) / m
    return re.toFixed(fixto)
}

export function stringFix(handle: string, fixto: number): String {
    if (!handle) return '-'
    const num = new Decimal(handle)
    let zero = '0.'
    let target = '<0.'
    for (let i = 0; i < fixto - 1; i++) {
        zero += '0'
        target += '0'
    }
    zero += '0'
    target += '1'
    return num.toFixed(fixto) == zero ? target : num.toFixed(fixto)
}
