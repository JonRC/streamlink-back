import { Express, GraphQLServer } from 'Server'
import { InitCluster } from 'Services/PuppeteerCluster'

const init = async () => {
  await InitCluster()
  Express.serverSetup()
  await GraphQLServer.init()
}

init()
// .then(() => doSearch('terror'))
// .then(content => JSON.stringify(content, null, 2))
// .then(result => {
//   console.log(result)
//   fs.writeFileSync('result.json', result)
// })
