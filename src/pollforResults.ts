/* eslint-disable no-console */
import request from 'request-promise-native'
import {retry} from '@lifeomic/attempt'

import {baseUrl, retryOptions} from './constants'

const getResults = async (
  deployId: string,
  deployerBaseUrl = baseUrl
): Promise<any> => {
  const resultsUri = `${deployerBaseUrl}/results/${deployId}`
  console.log(`requesting results from ${resultsUri}`)

  const finalResult = await retry(async () => {
    const result = await request({
      uri: resultsUri,
      method: 'GET',
      json: true
    })
    // retry until complete = true
    if (result.complete === false) {
      console.log(result)
      console.log('waiting')
      throw new Error()
    }
    return result
  }, retryOptions)
  return finalResult
}

export {getResults}
