import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from './pinia'
import { useBaseStore } from './store'
import { useTest2Store } from './store/test2'
import router from './router'
const store = createPinia()

store.use(function (store) {
  const local = Number(localStorage.getItem(`${store.$id}local`))
  if (local) {
    store.$patch({
      age: local
    })
  }

  store.$subscribe(
    ({ storeId }, state) => {
      localStorage.setItem(`${storeId}local`, state.age)
    },
    { deep: true }
  )
})
createApp(App).use(router).use(store).mount('#app')

const store1 = useBaseStore()
console.log(store1, 888)
const store2 = useTest2Store()
console.log(store2, 999)
