import { serverSetup } from "./server/setup";

const init = async () => {
  serverSetup();
};

init().catch((error) => {
  console.error();
});
