import {launch} from '../launchToDeployId'
import {deleteOrg} from '../delete'
import {getResults} from '../pollforResults'

const baseUrl = 'https://hosted-scratch-dev.herokuapp.com'
const timeLimit = 1000 * 60 * 30 // 30 minutes

describe('deployIdCheck', () => {
  jest.setTimeout(timeLimit)
  it('gets back a deployId and deletes the org', async () => {
    // request the deploy
    const deployId = await launch(
      `${baseUrl}/launch?template=https://github.com/mshanemc/df17AppBuilding&nopool=true`
    )
    // console.log(deployId)
    expect(deployId.startsWith('mshanemc-df17appbuilding-')).toBe(true)

    // get the results
    const results = await getResults(deployId, baseUrl)
    expect(results.complete).toBe(true)
    expect(results.errors.length).toBe(0)

    // delete the org
    const deleted = await deleteOrg(deployId, baseUrl)
    expect(deleted).toBe(true)
  })
})
