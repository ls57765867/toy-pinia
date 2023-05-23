// 三种格式: id + options options id+setup
import { piniaSymbol } from './createPinia'

export function defineStore(idOrOptions: any, setup: any) {
  let id: string
  let options: any
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
    options = setup
  } else {
    id = idOrOptions.id
    options = idOrOptions
  }
  let store = reactive({})
  function createSetupStore(id, setup, pinia) {
    let scope
    const { state, getters, actions } = options
    // pinia._e 是停止所有的监听 scope。stop是停止当前的监听
    const setupStore = pinia._e.run(() => {
      scope = effectScope()
      return scope.run(() => setup())
    })
    // 2.与state结合
    // 3.与actions 融合
    store = Object.assign(store, setupStore)

    function warpAction(key, action) {
      return function () {
        let ret = action.apply(store, arguments)
        // todo promise
        return ret
      }
    }

    for (let key in actions) {
      let val = store[key]
      if (typeof val === 'function') {
        // 3.1修改actions的this指向
        store[key] = warpAction(key, store[key])
      }
    }

    pinia._s.set(id, store)
  }

  function createOptionsStore(id, options, pinia) {
    const { state, getters, actions } = options

    function setup() {
      const localState = (pinia.state.value[id] = state ? state() : {})
      return Object.assign(
        localState,
        actions,
        Object.keys(getters || {}).reduce((memo, name) => {
          memo[name] = computed(() => {
            return getters[name].call(store, store)
          })
          return memo
        }, {})
      )
    }
    createSetupStore(id, setup, pinia)
  }

  const isSetupStore = typeof options === 'function'
  console.log(isSetupStore, 88)

  function useStore() {
    const instance = getCurrentInstance()
    let pinia = instance && inject(piniaSymbol)
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, options, pinia)
      } else {
        createOptionsStore(id, options, pinia)
      }
    }
    const store = pinia._s.get(id) || {}
    return store
  }

  return useStore
  // 当然也可能是setup
}
