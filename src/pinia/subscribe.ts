export function addSubscription(subscriptions: Array<() => void>, callback: (obj: Object) => void) {
  if (Array.isArray(subscriptions)) {
    subscriptions.push(callback)
  }
  const removeSubscription = (callback: () => void) => {
    const id = subscriptions.indexOf(callback)
    if (id > -1) {
      subscriptions.splice(id, 1)
    }
  }

  return removeSubscription
}

export function triggerSubscription(subscriptions: Array<() => void>, ...args: any[]) {
  subscriptions.forEach(item => item(...args))
}
