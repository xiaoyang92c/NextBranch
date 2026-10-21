# 下一枝 NEXT BRANCH

这是一个关于农科村枝条再生的小网站。你可以翻邮票认识植物，读一份像报纸的植物档案，再“领取”一枝，把它的生长记录留在放映室，也可以读信、写信给枝友。

目前它是前端演示，没有连接真实的库存、预约或账号系统。

## 在本地打开

在项目根目录运行：

```bash
python -m http.server 4173 --directory dist
```

然后打开 [http://localhost:4173/](http://localhost:4173/)。

页面放在 `dist/`。这是原生 HTML、CSS 和 JavaScript 网站，不需要 Vite，也没有运行时 npm 依赖。

## 网站里有什么

- **邮票馆**：看 10 种植物的邮票。拖动、滚轮或触屏滑动都能切换，点开邮票可以读植物档案。
- **植物档案**：用报纸的形式介绍植物、枝条来处和养护方法。每株植物都有光照、浇水、安苗或扦插的图解。
- **领取小票**：从档案末尾进入，按步骤填写并生成一张小票。这是体验流程，小票和二维码都不能用于实际领取。
- **枝条放映室**：看每株植物的 3 段养护动画，也能查看和记录生长近况。
- **枝友来信**：拆信、回信、搜索来信，或者写一封新信。

植物包括罗汉松、桂花、香泡、五角枫、紫薇、茶花、银杏、三角梅、六月雪和石榴。页面中的植物插画在 `dist/assets/`。

## 记录会保存在哪里

领取草稿、近况和信件保存在当前浏览器的 `localStorage`。换浏览器、换设备或清除网站数据后，它们不会跟着过去。页面里也有一些演示记录，方便直接体验流程。

养护内容区分了未生根的枝段和已经生根的小苗。罗汉松、香泡、五角枫、银杏的演示领取方式只提供小苗。实际能领取什么、怎么养，还是以驿站现场说明为准。

## 修改与部署

直接编辑 `dist/` 里的文件即可。提交前可以运行：

```bash
npm ci
npm run build
```

`npm run build` 会检查入口文件、JavaScript 语法、模块引用和静态资源；它不会重新打包页面。

Vercel 的设置已经写在根目录的 `vercel.json`：项目根目录保持仓库根目录，输出目录为 `dist`。不要把 Vercel 的 Root Directory 设成 `dist`。

## 素材和参考

信封纸张素材的生成说明见 [docs/letter-envelope-generation.md](docs/letter-envelope-generation.md)。养护文字参考了 [南京大学的香泡资料](https://www.nju.edu.cn/ysl/info/1361/9631.htm)、[Flora of China 的五角枫资料](https://efloras.org/florataxon.aspx?flora_id=2&taxon_id=250084190)、[RHS 茶花指南](https://www.rhs.org.uk/plants/camellia/growing-guide)、[RHS 柑橘指南](https://www.rhs.org.uk/fruit/citrus/grow-your-own?type=f)和 [RHS 软枝扦插指南](https://www.rhs.org.uk/propagation/softwood-cuttings)。
