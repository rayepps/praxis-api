import Color from 'color'


const theme = {
  colors: {
    green: Color('#3c6937'),
    greenHover: Color('#44903b'),
    yellow: Color('#ffbf00'),
    heading: Color('#031926'),
    white: Color('#FFFFFF'),
    black: Color('#000000'),
    lightGrey: Color('#eeeeee')
  }
}

export type Theme = typeof theme

export default theme