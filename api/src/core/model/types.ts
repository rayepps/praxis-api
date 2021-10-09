

export interface LinkRef {
  domain: string
  url: string  // The original url given
  code: string // The uid for this link
  link: string // The link generated with code included
  title: string
}