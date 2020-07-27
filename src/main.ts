/* eslint-disable no-console */
import * as core from '@actions/core'
import * as github from '@actions/github'
import {launch} from './launchToDeployId'
import {deleteOrg} from './delete'
import {getResults} from './pollforResults'

const defaultBranchName = 'master'

async function run(): Promise<void> {
  const baseUrl =
    core.getInput('deployer-url').length > 0
      ? core.getInput('deployer-url')
      : 'https://hosted-scratch-dev.herokuapp.com'
  try {
    // console.log(`ref is ${github.context.ref}`)
    const branch = github.context.ref.replace('refs/heads/', '')
    const launchUri =
      branch === defaultBranchName
        ? `${baseUrl}/launch?template=https://github.com/${github.context.repo.owner}/${github.context.repo.repo}&nopool=true`
        : `${baseUrl}/launch?template=https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/tree/${branch}&nopool=true`
    console.log(`requesting a deploy using ${launchUri}`)
    const deployId = await launch(launchUri)
    console.log(`deploying with id: ${deployId}`)

    // build the results api url /results:deployId
    const finalResult = await getResults(deployId)
    // check for errors (setFailed if there are any)
    if (finalResult.errors.length > 0) {
      core.setFailed('errors on deploy')
      for (const deployError of finalResult.errors) {
        console.log(JSON.stringify(deployError))
      }
    }
    core.setOutput('cds', finalResult)
    if (deployId) {
      await deleteOrg(deployId, baseUrl)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
