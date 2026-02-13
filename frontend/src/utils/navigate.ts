interface NavigateProps{
  link: (url: string) => void
  time: number
  url: string
}

export function navigate({link, time, url}: NavigateProps) {
  return setTimeout(() => {
    link(url)
  }, time)
}