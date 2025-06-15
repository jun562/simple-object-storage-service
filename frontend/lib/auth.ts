export interface User {
  username: string
  token: string
}

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("token")
  const username = localStorage.getItem("username")

  if (token && username) {
    return { token, username }
  }

  return null
}

export const storeUser = (user: User) => {
  localStorage.setItem("token", user.token)
  localStorage.setItem("username", user.username)
}

export const clearUser = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("username")
}

export const getAuthHeaders = () => {
  const user = getStoredUser()
  return user ? { Authorization: `Bearer ${user.token}` } : {}
}
