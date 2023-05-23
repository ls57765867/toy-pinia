// 三种格式: id + options options id+setup
import { piniaSymbol } from './createPinia'

export function defineStore(idOrOptions, setup) {
  let id
  let options
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
    options = setup
  } else {
    id = idOrOptions.id
    options = idOrOptions
  }

  function useStore() {
    const instance = getCurrentInstance()
    let pinia = instance && inject(piniaSymbol)
    if (!pinia._s.has(id)) {
      pinia._s.set(id, options)
      console.log(pinia, 33)
    }
  }

  return useStore
  // 当然也可能是setup
}
