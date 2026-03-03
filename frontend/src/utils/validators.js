export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 30
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validateServerName = (name) => {
  return name && name.length >= 2 && name.length <= 100
}

export const validateChannelName = (name) => {
  const re = /^[a-z0-9-]+$/
  return name && name.length >= 1 && name.length <= 50 && re.test(name)
}

export const validateMessage = (text) => {
  return text && text.trim().length > 0 && text.length <= 2000
}