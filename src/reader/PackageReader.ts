import License from '../models/License'
import LicenseList from '../models/LicenseList'
import walkDependencies from './DependencyReader'
import fs from 'fs-extra'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const readInstalled = require('read-installed')

export default function readPackages(cmdOpt: CmdOption): Promise<License[]> {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const directDependencies = Object.keys(packageJson.dependencies || {}).concat(
    cmdOpt.includeDevDependencies
      ? Object.keys(packageJson.devDependencies || {})
      : []
  )
  return new Promise<License[]>((resolve, reject) => {
    const inputPath = '.'
    readInstalled(
      inputPath,
      {
        dev: cmdOpt.includeDevDependencies,
        depth: cmdOpt.depth,
        tree: cmdOpt.stopPackages.length > 0 // exact dependency tree is necessary to stop dependency walk
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err: any, pkg: Package) => {
        if (err) {
          reject(err)
        }
        const licenseList = walkDependencies(
          pkg,
          new LicenseList({}, cmdOpt),
          cmdOpt,
          directDependencies
        )
        const licenses = licenseList.getList().sort((lhs, rhs) => {
          if (lhs.libraryName < rhs.libraryName) {
            return -1
          }
          if (lhs.libraryName > rhs.libraryName) {
            return 1
          }
          return 0
        })
        resolve(licenses)
      }
    )
  })
}
