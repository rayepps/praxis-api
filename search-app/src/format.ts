import { formatDistance, differenceInHours, format } from 'date-fns'


const DATE_FORMAT = 'MM/d/yyyy'


export const numbers = {
    decimals: (num: number) => parseInt(((num - Math.floor(num)) * Math.pow(10, 2)).toFixed(0)),
    whole: (num: number) => Math.trunc(num / 100)
}

export const currency = {
    formatRawAmount: (amount: number) => {
        if (!amount || amount === 0) {
            return '$0'
        }
        return `$${numbers.whole(amount)}.${numbers.decimals(amount)}`
    }
}

export const dates = {
    distanceFromNow: (dateable: number | Date) => {
        return formatDistance(new Date(dateable), new Date(), { addSuffix: true })
    },
    readableDistanceFromNow: (dateable: number | Date) => {
        const hoursAgo = differenceInHours(new Date(), new Date(dateable))
        const daysAgo = hoursAgo / 24
        if (daysAgo < 1) return `${dates.distanceFromNow(dateable)}`.replace('about', '')
        if (daysAgo < 2) return 'yesterday'
        if (daysAgo < 5) return `${dates.distanceFromNow(dateable)}`.replace('about', '')
        return format(dateable, DATE_FORMAT)
    }
}

export const colors = {
    contrast: (map: { light: string, dark: string }, color: string) => {
        if (!color) {
            return map.light
        }
        const luma = colors.luma(color)
        if (luma < 125) return map.light
        return map.dark
    },
    // color can be a hx string or an array of RGB values 0-255
    luma: (color: string) => {
        const [r, g, b] = colors.hexToRGBArray(color)
        // SMPTE C, Rec. 709 weightings
        return (0.2126 * r) + (0.7152 * g) + (0.0722 * b)
    },
    hexToRGBArray: (color: string): [number, number, number] => {
        let c = color.replace('#', '')
        if (c.length === 3) {
            const [a,b,e] = c.split('')
            c = `${a}${a}${b}${b}${e}${e}`
        } else if (c.length !== 6) {
            c = 'FFFFFF'
        }
        const rgb: [number, number, number] = [0, 0, 0]
        for (let i = 0; i <= 2; i++) {
            rgb[i] = parseInt(c.substr(i * 2, 2), 16)
        }
        return rgb
    }
}

export default {
    numbers,
    dates,
    currency,
    colors
}