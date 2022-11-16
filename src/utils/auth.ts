const AUTH_KEY = `LISUDOKU_${process.env.NODE_ENV}`

export const userToken = () => {
  return JSON.parse(localStorage.getItem(AUTH_KEY)!)?.token
}

export const userName = () => {
  return JSON.parse(localStorage.getItem(AUTH_KEY)!)?.name
}

export const clearToken = () => {
  localStorage.removeItem(AUTH_KEY)
}

export const setUserData = ({ name, token }: { name: string, token: string }) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    name,
    token,
  }))
}
