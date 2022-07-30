import { serverSetup } from 'Server/setup'

const init = async () => {
  serverSetup()
}

init().catch(() => {
  console.error()
})
