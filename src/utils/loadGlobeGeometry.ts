import type { GlobeGeometryData } from '@/types/globe'
import meshUrl from '@/assets/maps/world-mesh.bin.gz?url'

let cached: Promise<GlobeGeometryData> | null = null

/** Decodes a quantized, delta-encoded CLG1 mesh without rebuilding polygons. */
export function decodeGlobeGeometry(buffer: ArrayBuffer): GlobeGeometryData {
  if (buffer.byteLength < 24) throw new Error('地球轮廓数据不完整')
  const header = new DataView(buffer)
  if (header.getUint32(0, true) !== 0x31474c43 || header.getUint32(4, true) !== 2)
    throw new Error('地球轮廓格式无效')
  const vertices = header.getUint32(8, true)
  const indices = header.getUint32(12, true)
  const borders = header.getUint32(16, true)
  if (
    !vertices ||
    vertices > 2000000 ||
    indices % 3 ||
    borders % 2 ||
    24 + vertices * 3 + indices + borders > buffer.byteLength
  )
    throw new Error('地球轮廓数据不完整')
  const bytes = new Uint8Array(buffer)
  let offset = 24
  function decode(target: Int16Array | Uint32Array, stride: number, min: number, max: number) {
    const previous = new Array<number>(stride).fill(0)
    for (let i = 0; i < target.length; i++) {
      let encoded = 0
      let shift = 0
      let next: number
      do {
        if (offset >= bytes.length || shift > 21) throw new Error('地球轮廓编码无效')
        next = bytes[offset++]
        encoded |= (next & 127) << shift
        shift += 7
      } while (next & 128)
      const axis = i % stride
      const value = previous[axis] + ((encoded >>> 1) ^ -(encoded & 1))
      if (value < min || value > max) throw new Error('地球轮廓索引或坐标无效')
      target[i] = previous[axis] = value
    }
  }
  const result = {
    positions: new Int16Array(vertices * 3),
    indices: new Uint32Array(indices),
    borders: new Uint32Array(borders),
  }
  decode(result.positions, 3, -32767, 32767)
  decode(result.indices, 1, 0, vertices - 1)
  decode(result.borders, 1, 0, vertices - 1)
  if (offset !== bytes.length) throw new Error('地球轮廓长度无效')
  return result
}

async function fetchGeometry(): Promise<GlobeGeometryData> {
  const response = await fetch(meshUrl)
  if (!response.ok) throw new Error('地球轮廓加载失败')
  let bytes = new Uint8Array(await response.arrayBuffer())
  // 部分托管服务自动解压 .gz，按文件头判断，避免重复解压。
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    if (typeof DecompressionStream !== 'undefined') {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
      bytes = new Uint8Array(await new Response(stream).arrayBuffer())
    } else {
      const { gunzipSync } = await import('three/addons/libs/fflate.module.js')
      bytes = gunzipSync(bytes)
    }
  }
  return decodeGlobeGeometry(bytes.slice().buffer)
}

/** Shares static decoded data across visits while allowing each view to cancel. */
export function loadGlobeGeometry(signal: AbortSignal): Promise<GlobeGeometryData> {
  signal.throwIfAborted()
  cached ??= fetchGeometry().catch((error: unknown) => {
    cached = null
    throw error
  })
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason)
    signal.addEventListener('abort', onAbort, { once: true })
    cached!.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort))
  })
}
