/* eslint-disable no-console */
import request from 'request-promise-native'
import {retry} from '@lifeomic/attempt'

import {baseUrl, retryOptions} from './constants'

const deleteOrg = async (
  deployId: string,
  deployerBaseUrl = baseUrl
): Promise<boolean> => {
  await retry(async () => {
    console.log('attempting delete')
    const deleteResult = await request({
      method: 'POST',
      uri: `${deployerBaseUrl}/delete`,
      body: JSON.stringify({
        deployId
      }),
      followAllRedirects: true
    })
    console.log(deleteResult)
  }, retryOptions)
  return true
}

export {deleteOrg}
