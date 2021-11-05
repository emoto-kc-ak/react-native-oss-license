import fs from 'fs-extra'
import glob from 'glob'
import path from 'path'
import LicenseList from '../models/LicenseList'
import License from '../models/License'

function pkgToLicense(pkg: Package): License {
  return new License(
    pkg.name,
    pkg.version,
    pkg.license,
    pkg.description,
    pkg.homepage,
    pkg.author,
    pkg.repository,
    pkg.licenseContent
  )
}

export default function walkDependencies(
  pkg: Package,
  licenseList: LicenseList,
  opt: CmdOption,
  directDependencies: string[]
): LicenseList {
  if (
    !pkg.dependencies ||
    pkg.extraneous ||
    licenseList.exists(pkg.name, pkg.version)
  ) {
    return licenseList
  }

  if (pkg.depth > 0) {
    const isDirectDependency = directDependencies.indexOf(pkg.name) >= 0
    if (opt.onlyDirectDependency && !isDirectDependency) return licenseList
    const licenseFiles = glob.sync(
      path.join(pkg.path, '{LICENSE,License,license}*')
    )
    if (licenseFiles.length > 0) {
      pkg.licenseContent = fs.readFileSync(licenseFiles[0], 'utf8')
    }
    licenseList.add(pkgToLicense(pkg))
  }

  if (opt.stopPackages.indexOf(pkg.name) === -1) {
    Object.keys(pkg.dependencies).forEach(objKey => {
      if (!pkg.dependencies) return
      const dep = pkg.dependencies[objKey]
      licenseList = walkDependencies(dep, licenseList, opt, directDependencies)
    })
  }
  return licenseList
}
