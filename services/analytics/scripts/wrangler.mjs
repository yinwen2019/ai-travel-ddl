import { spawn } from 'node:child_process'
// 统计服务不加载项目根目录中 AI 更新脚本的 .env 密钥。
const cli = new URL('../../../node_modules/wrangler/bin/wrangler.js', import.meta.url)
const child = spawn(process.execPath, [cli.pathname, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false' },
})
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal))
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
