import type { App } from 'vue'
export const piniaSymbol = Symbol()
export const createPinia = () => {
  const scope = effectScope(true)
  // 保存每一个store的ref
  // state中可能会存放计算属性 也可能随时停止不继续计算
  // 我们需要随时监听状态并停止,所以直接使用effectScope 将ref包裹以控制监听状态,scope.stop就可以直接停止所有方法
  const state = scope.run(() => ref({}))

  const pinia = {
    // 对于pinia而言需要一个内容来管理所以的store,既能使用又可以随时卸载或重置
    _s: new Map(), // 需要创建一个map来收集所以的store
    _e: scope,
    state,
    // 首先在install中会接收app
    install(app: App) {
      // 就像el-form 表单一个 需要收集所有的store可以将自己传给store 所有组件都可以通过 inject来获得
      app.provide(piniaSymbol, pinia)
    }
  }
  return pinia
}
