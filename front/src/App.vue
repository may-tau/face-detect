<script setup>
import axios from "axios";
import { ref, shallowRef } from "vue";
import AdminView from "./components/AdminView.vue";
import Login from "./components/Login.vue";
import UserView from "./components/UserView.vue";

const isLoggedIn = ref();
const viewComponent = shallowRef();

function setLoggedIn() {
  const uname = JSON.parse(atob(sessionStorage.jwt.split(".")[1])).uname;
  viewComponent.value = uname === "admin" ? AdminView : UserView;
  isLoggedIn.value = true;
}

function logOff() {
  delete sessionStorage.jwt;
  isLoggedIn.value = false;
}

if (!sessionStorage.jwt) {
  isLoggedIn.value = false;
} else {
  axios
    .post("//localhost:3333/verify", {
      jwt: sessionStorage.jwt,
    })
    .then((res) => {
      if (res.status == 200) {
        setLoggedIn();
      }
    })
    .catch((err) => {
      if (err.response.status == 401) {
        isLoggedIn.value = false;
      }
    });
}
</script>

<template>
  <div v-if="isLoggedIn === undefined">Wait a sec..</div>
  <component v-else-if="isLoggedIn === true" :is="viewComponent">
    <i class="pi pi-power-off" title="log off" @click="logOff"></i>
  </component>
  <Login v-else @logged-in="setLoggedIn" />
</template>