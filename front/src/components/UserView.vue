<script setup>
import axios from "axios";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FileUpload from "primevue/fileupload";
import InputText from "primevue/inputtext";
import { mwUrl } from "../composables/useBackend";
import { nextTick, ref, onBeforeUnmount } from "vue";

const fileName = ref("");
const fileUploader = ref();
const isDialogVisible = ref(false);
const tasks = ref([]);
const uname = JSON.parse(atob(sessionStorage.jwt.split(".")[1])).uname;

function fetchUserTasks() {
  axios
    .post(mwUrl("listTasks"), {
      jwt: sessionStorage.jwt,
    })
    .then((res) => (tasks.value = res.data))
    .catch((e) => console.warn(e));
}

function onBeforeUpload({ formData }) {
  formData.append("fname", fileName.value);
  formData.append("jwt", sessionStorage.jwt);
}

function onUpload() {
  fetchUserTasks();
  nextTick(
    () =>
      (document.querySelector(".p-fileupload-file-name").innerHTML =
        fileName.value)
  );
  setTimeout(() => fileUploader.value.clear(), 3000);
  console.warn(fileUploader.value);
}

function saveFileName() {
  if (fileName.value) {
    document.querySelector(".p-fileupload-file-name").innerHTML =
      fileName.value;
    isDialogVisible.value = false;
    fileUploader.value.upload();
  }
}

const poll = setInterval(fetchUserTasks, 1000);
onBeforeUnmount(() => clearInterval(poll));
fetchUserTasks();
</script>

<template>
  <div>
    <header>
      <span
        >Welp, <b>@{{ uname }}</b
        >, what are we gonna do today?</span
      >
      <span><slot /></span>
    </header>
    <FileUpload
      accept="image/*"
      chooseLabel="Image"
      :fileLimit="1"
      :maxFileSize="1000000"
      :multiple="false"
      name="file"
      ref="fileUploader"
      :show-cancel-button="false"
      :show-upload-button="false"
      :url="mwUrl('upload')"
      @before-upload="onBeforeUpload"
      @select="isDialogVisible = true"
      @upload="onUpload"
    >
      <template #empty>
        <p>Drag and drop dat image you have there</p>
      </template>
    </FileUpload>

    <Dialog
      :closable="false"
      modal
      :style="{ width: '50vw' }"
      v-model:visible="isDialogVisible"
    >
      <label>Name it: &nbsp;<InputText autofocus v-model="fileName" /></label>&nbsp;&nbsp;
      <Button icon="pi pi-check" @click="saveFileName" />
    </Dialog>

    <br />

    <header>Your tasks:</header>
    <div v-if="!tasks.length">There none as of now.</div>
    <table v-else>
      <tr>
        <th>Name</th>
        <th>Status</th>
      </tr>
      <tr v-for="task in tasks">
        <td>{{ task.name }}</td>
        <td>
          {{ task.status + (!isNaN(task.status) ? " faces detected" : "") }}
        </td>
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
