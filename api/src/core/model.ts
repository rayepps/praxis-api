

export const slugger = (str: string) => {
  return str.toLowerCase()
    .replace(/\s/g, '-')                // \s with -
    .replace(/\-([^a-z0-9]+)\-/g, '-')  // -  &* - with -
    .replace(/[^a-z0-9]/g, '-')         // non alpha numeric with -
}

export default {
  slugger
}