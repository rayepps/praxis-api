import { uglify } from 'rollup-plugin-uglify'
export default {
  input: 'build/kickstart.js',
  output: {
    file: 'build/kickstart.min.js',
    format: 'iife'
  },
  plugins: [uglify()]
}