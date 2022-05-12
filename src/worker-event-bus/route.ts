export function routePush(route: string[] | null, connectionId: string) {
  if (!route) {
    route = [connectionId]
  } else {
    route.push(connectionId)
  }
  return route
}

export function routePop(route: string[] | null, connectionId: string) {
  const len = route?.length || 0
  if (!len || route[len - 1] !== connectionId) {
    return false
  }
  route.length = len - 1
  return true
}
