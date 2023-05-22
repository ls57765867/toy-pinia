import type { App } from 'vue'
export const piniaSymbol = Symbol()
export const createPinia = () => {
  const pinia = {
    // 对于pinia而言需要一个内容来管理所以的store,既能使用又可以随时卸载或重置
    _s: new Map(), // 需要创建一个map来收集所以的store
    // 首先在install中会接收app
    install(app: App) {
      // 就像el-form 表单一个 需要收集所有的store可以将自己传给store 所有组件都可以通过 inject来获得
      app.provide(piniaSymbol, pinia)
    }
  }
  return pinia
}
