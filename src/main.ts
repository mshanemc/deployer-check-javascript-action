import * as core from '@actions/core'
import * as github from '@actions/github'
import request from 'request-promise-native'
import {retry} from '@lifeomic/attempt'

const retryOptions = {
  delay: 10000,
  initialDelay: 10000,
  maxAttempts: 6 * 30
}

const defaultBranchName = 'master'

async function run(): Promise<void> {
  let baseUrl =
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
    let resultsUri: string
    let deployId: string = ''
    console.log(`requesting a deploy using ${launchUri}`)

    try {
      await request({
        method: 'GET',
        uri: launchUri,
        followRedirect: false,
        resolveWithFullResponse: false
      })
    } catch (error) {
      if (error.statusCode === 302) {
        console.log(`redirected to ${error.response.caseless.dict.location}`)
        // parse the response for the deployId
        deployId = error.response.caseless.dict.location
          .replace('/deploying/deployer/', '')
          .replace('/#deploying/deployer/', '')
        resultsUri = `${baseUrl}/results/${deployId}`
      } else {
        throw new Error('bad response from /launch')
      }
    }

    // build the results api url /results:deployId
    const finalResult = await retry(async () => {
      const result = await request({
        uri: resultsUri,
        method: 'GET',
        json: true
      })
      // retry until complete = true
      if (!result.complete) {
        console.log(result)
        console.log('waiting')
        throw new Error()
      }
      return result
    }, retryOptions)
    console.log(finalResult)
    // check for errors (setFailed if there are any)
    if (finalResult.errors.length > 0) {
      core.setFailed('errors on deploy')
      finalResult.errors.forEach((deployError: any) =>
        console.log(JSON.stringify(deployError))
      )
    }
    core.setOutput('cds', finalResult)
    if (deployId) {
      await retry(async () => {
        console.log('attempting delete')
        const deleteResult = await request({
          method: 'POST',
          uri: `${baseUrl}/delete`,
          body: JSON.stringify({
            deployId
          }),
          followAllRedirects: true
        })
        console.log(deleteResult)
      }, retryOptions)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
