# 下一枝 NEXT BRANCH

农科村枝条邮局的交互式前端原型。建议在项目目录运行 `python -m http.server 4173 --directory dist`，然后访问 `http://localhost:4173/`。

## Vercel 配置

这是一个原生 HTML、CSS、JavaScript 静态网站，首页位于 `dist/index.html`，不使用 Vite，也没有第三方 npm 依赖。`dist` 是网站源文件目录，需要保留在 Git 中。

在仓库根目录执行 `npm ci`，再执行 `npm run build`。构建脚本检查首页引用、JavaScript 语法、相对模块引用及静态文件完整性，直接使用现有 `dist` 文件，不打包或重写页面。

仓库根目录的 `vercel.json` 明确设置 Framework 为 Other（`null`）、Install Command 为 `npm ci`、Build Command 为 `npm run build`、Output Directory 为 `dist`，覆盖控制台中错误的 `vite build`。Vercel 项目的 Root Directory 应保持仓库根目录（留空），不能设为 `dist`。`package.json`、`package-lock.json`、`vercel.json` 和 `scripts/` 位于同一根目录，配置推送到 GitHub 后由关联的 Vercel 项目自动重新部署。

## 演示流程

邮票馆采用整屏斜向邮票展台：拖动或滚轮可沿约 45° 的轨迹切换邮票，轻触中央邮票放大观察。领取枝条是可横向、纵向拖动的邮票展馆。完整路径为：邮票馆或枝条展馆 → 放大观察 → 植物资料 → 枝条邮单 → 模拟现场领取 → 我的邮册 → 生长明信片。枝友来信支持浏览、提问和枝友回复。内容保存在当前浏览器的 `localStorage` 中，没有接入真实库存、预约核销、账号或园艺人员。

初始邮册中的紫薇领取记录、明信片和社区问答均为明确标记的演示数据。领取邮单中的二维码图形只承担视觉占位，不可用于核销。

## 植物插画

`dist/assets/` 中的 8 幅 WebP 插画由内置图像生成工具创建，分别为月季、紫薇、桂花、绣球、茉莉、迷迭香、栀子和三角梅。每幅插画采用独立提示词，统一要求为：透明背景、单株植物枝条、植物图鉴式细密线条与轻微丝网印刷质感，不含文字、边框或邮戳。页面代码绘制邮票齿孔、面值、名称和编号。
