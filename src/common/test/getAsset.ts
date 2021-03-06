import path from 'path'
import fse from 'fs-extra'

export function getAssetPath(assetFileName: string) {
  const filePath = path.resolve(__dirname, 'assets', assetFileName)
  return filePath
}

export async function getAssetData(assetFileName: string) {
  const filePath = getAssetPath(assetFileName)
  const buffer = await fse.readFile(filePath)
  return new Uint8Array(buffer)
}

export function createAssetStream(assetFileName: string) {
  const filePath = path.resolve(__dirname, 'assets', assetFileName)
  const stream = fse.createReadStream(filePath)
  return stream
}

export function loadAssetData(assetFileName: string) {
  const filePath = path.resolve(__dirname, 'assets', assetFileName)
  const stream = fse.createReadStream(filePath)
  return stream
}
