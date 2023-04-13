import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from 'primevue/config';

import "primevue/resources/themes/bootstrap4-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "./style.css";

const app = createApp(App);
app.use(PrimeVue, { ripple: true });
app.mount("#app");
