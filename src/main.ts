import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    core.debug(`repo is ${github.context.repo}`)
    core.debug(`ref is ${github.context.ref}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
