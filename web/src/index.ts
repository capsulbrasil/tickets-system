import { useApp, defineOptions, AeriaMain } from "aeria-ui";
import { ptbr } from "./i18n/index.js";
import { routes } from "./routes.js";
import * as stores from "./stores";

import "@aeria-ui/ui/style.css";
import "aeria-app-layout/style.css";
import "./style/main.less";

import aeriaPtbr from "@aeria-ui/i18n-pt";

import NoResults from "./components/no-results.vue";

const options = defineOptions({
  setup: ({ context }) => {
    Object.values(stores).map((createStore) => createStore(context));
  },
  component: AeriaMain,
  routes,
  i18n: {
    current: "pt_BR",
    locales: {
      pt_BR: [aeriaPtbr, ptbr],
    },
  },
  menuSchema: [
    "/dashboard/",
    "/dashboard/topic",
    // "/dashboard/contacts",
    // "/dashboard/broadcast",
    "/dashboard/user",
  ],
});

useApp(options).then(({ app, mount }) => {
  app.provide("noResultsComponent", NoResults);
  mount();
});
