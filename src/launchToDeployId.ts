/* eslint-disable no-console */
import request from 'request-promise-native'

const launch = async (launchUri: string): Promise<string> => {
  try {
    const response = await request({
      method: 'GET',
      uri: launchUri,
      followRedirect: false,
      resolveWithFullResponse: false
    })
    console.log('received non-error response', response)
    throw new Error('redirect problem')
  } catch (error) {
    if (error.statusCode === 302) {
      console.log(`redirected to ${error.response.caseless.dict.location}`)
      // parse the response for the deployId
      const splits = error.response.caseless.dict.location.split('/')
      return splits[splits.length - 1]
    } else {
      console.log(error)
      throw new Error('bad response from /launch')
    }
  }
}

export {launch}
