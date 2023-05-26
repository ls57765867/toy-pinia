import { Names } from './store-name'
import { defineStore } from '../pinia'

export const useTest2Store = defineStore(Names.TEST2, () => {
  const state = reactive({
    name: '科比',
    age: 50
  })
  const test = ref('test')
  const editName = () => {
    state.name = '勒布朗'
  }
  const log = computed(() => state.name + '今年' + state.age)
  return {
    ...toRefs(state),
    state,
    log,
    test,
    editName
  }
})
