<script setup>
import axios from 'axios';
import { ref } from "vue";

const emit = defineEmits(['logged-in']);
const uname = ref("");

function onSubmit(ev) {
  ev.preventDefault();
  axios.post("//localhost:3333/getIn", {
    uname: uname.value
  }).then(res => {
    if (res.status == 200 && res.data && /\w+\.\w+\.\w+/.test(res.data)) {
      sessionStorage.jwt = res.data;
      emit('logged-in');
    }
  });
}
</script>

<template>
  <form @submit="onSubmit">
    <label
      ><h3>Who let the dogs out?</h3>
      <input v-model="uname"
    /></label>
  </form>
</template>

<style scoped>
form {
  align-self: center;
}

input {
  padding: 0.5em;
}
</style>
