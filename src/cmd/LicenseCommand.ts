import { Command } from 'commander'
import Format from '../models/Format'

export default class LicenseCommand {
  constructor(private program: Command) {
    this.program
      .option(
        '-f, --format <format>',
        `output format. options:[${Format.getSupportedFormats()}]`
      )
      .option('--dev', 'include devDependencies', false)
      .option('--depth <depth>', 'dependencies depth', Infinity)
      .option('--output-path <outputPath>', 'specify path where output file')
      .option('--json', 'output json to stdout', false)
      .option('--add-version-number', 'write library version number', false)
      .option(
        '--only-direct-dependency',
        'output only dependencies you write packages.json.',
        false
      )
      .option(
        '--skip-not-required',
        'skip licenses those not require copyright notice',
        false
      )
      .option(
        '--stop-packages <stopPackages>',
        'stop dependency walk at these packages.' +
        ' specify semicolon separated package names',
        ''
      )
      .version('0.0.1', '--version', 'show current version')
  }

  parse(args: string[]): CmdOption {
    this.program.parse(args)
    return this.toCmdOption(this.program)
  }

  private toCmdOption(command: Command): CmdOption {
    return {
      includeDevDependencies: command.dev,
      depth: command.depth,
      format: command.format || null,
      outputJson: command.json,
      outputPath: command.outputPath,
      addVersionNumber: command.addVersionNumber,
      onlyDirectDependency: command.onlyDirectDependency,
      skipNotRequired: command.skipNotRequired,
      stopPackages: command.stopPackages.split(';').map((p: string) => p.trim()) || []
    }
  }
}
