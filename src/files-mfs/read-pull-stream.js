/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const pullToPromise = require('pull-to-promise')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.readPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not read not found, expect error', () => {
      const testDir = `/test-${hat()}`

      return expect(pullToPromise.any(ipfs.files.readPullStream(`${testDir}/404`))).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.have.property('message')
        .that.include('does not exist')
    })

    it('should read file', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir)
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true })

      const bufs = await pullToPromise.any(ipfs.files.readPullStream(`${testDir}/a`))

      expect(bufs).to.eql([Buffer.from('Hello, world!')])
    })
  })
}
