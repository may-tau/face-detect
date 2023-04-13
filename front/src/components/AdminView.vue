<script setup>
import axios from "axios";
import { mwUrl } from "../composables/useBackend";
import { ref, onBeforeUnmount } from "vue";

const uname = JSON.parse(atob(sessionStorage.jwt.split(".")[1])).uname;
const users = ref({});

function fetchUsers() {
  axios
    .post(mwUrl("listUsers"), {
      jwt: sessionStorage.jwt,
    })
    .then((res) => (users.value = res.data))
    .catch((e) => console.warn(e));
}

const poll = setInterval(fetchUsers, 2000);
onBeforeUnmount(() => clearInterval(poll));
fetchUsers();
</script>

<template>
  <div>
    <header>
      <span>Oh, mighty <b>@admin</b> 🙏, look at all these beautiful users..</span>
      <span><slot/></span>
    </header>
    <div v-if="!Object.keys(users).length">Well, there are not really any so far, haha.</div>
    <table v-else>
      <tr>
        <th>Name</th>
        <th>Tasks</th>
        <th>Recognized faces</th>
      </tr>
      <tr v-for="(tasks, userName) in users">
        <td>{{ userName }}</td>
        <td>{{ tasks.length }}</td>
        <td>{{ tasks.reduce((acc, task) => {
          if (!isNaN(task.status)) {
            acc += +task.status;
          }
          return acc;
        }, 0) }}</td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
header {
  font-size: 2em;
  margin-bottom: 1em;
  display: flex;
  justify-content: space-between;
}

table :is(td, th) {
  padding: 0.5em 1em;
}
</style>
