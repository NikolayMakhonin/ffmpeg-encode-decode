import path from 'path'
import fse from 'fs-extra'
import {fileURLToPath} from 'url'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function saveFile(fileName: string, data: any) {
  const outputFilePath = path.resolve('./tmp/', path.relative('./src', path.resolve(__dirname, 'assets', fileName)))
  if (fse.existsSync(outputFilePath)) {
    await fse.unlink(outputFilePath)
  }
  const dir = path.dirname(outputFilePath)
  if (!fse.existsSync(dir)) {
    await fse.mkdirp(dir)
  }
  await fse.writeFile(outputFilePath, data)
}
