// 三种格式: id + options options id+setup
import { piniaSymbol } from './createPinia'
import { addSubscription, triggerSubscription } from './subscribe'

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

  function createSetupStore(id, setup, pinia, isOption) {
    let scope
    let store = reactive({})
    const { state, getters, actions } = options
    const initialState = pinia.state.value[id]
    function handlePatch(fnOrObj) {
      if (typeof fnOrObj === 'function') {
        fnOrObj(pinia.state.value[id])
      } else {
        Object.assign(pinia.state.value[id], fnOrObj)
      }
    }
    let subscriptionArray = [] as Array<() => void>

    const fn = {
      $patch: handlePatch,
      $subscribe: function (cb, options) {
        watch(
          () => pinia.state.value[id],
          () => {
            cb(store)
          },
          options
        )
      },
      // { after, onError }
      $onAction(callback: ({ after, onError }: { after: any; onError: any }) => void) {
        addSubscription(subscriptionArray, callback)
      }
    }
    if (!initialState && !isOption) {
      pinia.state.value[id] = {}
    }

    // pinia._e 是停止所有的监听 scope。stop是停止当前的监听
    const setupStore = pinia._e.run(() => {
      scope = effectScope()
      return scope.run(() => setup())
    })

    function isComputed(val) {
      return !!(isRef(val) && val.effect)
    }
    function warpAction(key, action) {
      return function () {
        let subscriptionAfterArray = []
        let subscriptionErrorArray = []
        function after(callback) {
          subscriptionAfterArray.push(callback)
        }
        function onError(callback) {
          subscriptionErrorArray.push(callback)
        }
        let ret
        try {
          triggerSubscription(subscriptionArray, { after, onError })
          ret = action.apply(store, arguments)
          triggerSubscription(subscriptionAfterArray)
        } catch (e) {
          triggerSubscription(subscriptionErrorArray, e)
        }

        // todo promise
        return ret
      }
    }

    for (let key in setupStore) {
      let val = setupStore[key]

      if (isOption) {
        if (typeof val === 'function') {
          // 3.1修改actions的this指向
          setupStore[key] = warpAction(key, setupStore[key])
        }
      } else {
        if ((!isComputed(val) && isRef(val)) || isReactive(val)) {
          pinia.state.value[id][key] = val
        }
      }
    }

    // 2.与state结合
    // 3.与actions 融合
    store = Object.assign(store, setupStore, fn)
    pinia._s.set(id, store)
    return store
  }

  function createOptionsStore(id, options, pinia) {
    const { state, getters, actions } = options

    function setup() {
      pinia.state.value[id] = state ? state() : {}
      const localState = toRefs(pinia.state.value[id])
      return Object.assign(
        localState,
        actions,
        Object.keys(getters || {}).reduce((memo, name) => {
          memo[name] = computed(() => {
            const store = pinia._s.get(id)
            return getters[name].call(store, store)
          })
          return memo
        }, {})
      )
    }
    const store = createSetupStore(id, setup, pinia, true)
    store.$reset = function () {
      store.$patch(val => {
        Object.assign(val, state())
      })
    }
  }

  const isSetupStore = typeof options === 'function'

  function useStore() {
    const instance = getCurrentInstance()
    let pinia = instance && inject(piniaSymbol)
    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, options, pinia, false)
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
