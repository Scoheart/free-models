# 免费模型 · Free Models

汇总公开 X 帖子中的**免费 AI 模型额度与限时活动**。本仓库托管静态页面，由自动化流程根据 `items.json` 更新。

## 在线页面

GitHub Pages：https://scoheart.github.io/free-models/

若 404：到仓库 **Settings → Pages → Build and deployment**，Source 选 **Deploy from a branch**，Branch 选 **main** / **/**（根目录），保存后约 1 分钟生效。

## 仓库根目录即站点

Pages 从 `main` 根目录发布，主要文件：

- `index.html` / `data.js`（含 `const ITEMS = ...`）/ `app.js` / `items.json`

## 本地重新生成

```bash
cd /workspace/free-models   # 或本仓库检出目录
./build-site.sh
# 然后把 site/ 下文件推到仓库根目录（index.html data.js app.js items.json）
```

## 数据说明

- 只收录真实公开帖子，不编造条目
- 类型含：限时、额度、API、模型 等
- 页脚声明：数据来自公开 X 帖子，仅汇总不担保可用性

## 更新流程

猎手扫描 X → 写入 `items.json` → 编辑运行 `build-site.sh` → 推送站点文件到 `main` → Pages 自动更新
