<template>
  <div>{{ store.name }}今年{{ store.age }}了</div>
  <div>双倍年龄是：{{ store.doubleAge }}</div>
  <el-button @click="editName">换个名字</el-button>
  <el-button @click="editAge">年龄+1</el-button>
  <el-divider></el-divider>
  <el-tag>{{ testStore.name }}</el-tag>
  <br />
  <el-tag>{{ testStore.age }}</el-tag>
  <br />
  <el-button @click="handleCilckButton">换个球员</el-button>

  <div class="text-green-800 mt-10">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { useBaseStore } from "./store";
// import { storeToRefs } from 'pinia'
import { useTest2Store } from "./store/test2";

const state = reactive({ test: "test" });
const store = useBaseStore();
const { setName } = store;
const testStore = useTest2Store();
console.log(testStore,33);
// const { name, age, doubleAge } = storeToRefs(store)
const editName = () => {
  setName("小刘" + Math.random());
};
const editAge = () => {
  store.addAge(1)
};

const handleCilckButton = () => {
  console.log(testStore);
  testStore.editName();
};
</script>

<style lang="scss" scoped></style>
