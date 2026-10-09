# 免费模型 · Free Models

汇总公开 X 帖子中的**免费 AI 模型额度与限时活动**。按 **Provider / Agent / Model** 分类，卡片上可一键跳转创建 API Key、下载 Agent 或查看模型页。

## 在线页面

https://scoheart.github.io/free-models/

## 功能

- 顶栏视图：全部｜Provider｜Agent｜Model（优先露出 OpenRouter / GMI / 百炼 / TokenHub 与 Cline / OpenCode / Copilot / WorkBuddy）
- 场景与门槛多选筛选；只看未过期；截止时间与过期灰显
- 行动按钮：创建 API Key · {Provider} / 下载 Agent · {Agent} / 查看模型 · {Model}
- 最新在上；链接回原帖；手机友好

## 仓库根目录即站点

- `index.html` / `data.js`（含 `const ITEMS = ...`）/ `app.js` / `items.json`
- 生成源：`templates/app.js`、`templates/styles.css`、`build_index.py`、`build-site.sh`

## 本地重新生成

```bash
./build-site.sh
# 镜像 site/ → 仓库根目录后推送 main
```

## 数据字段

每条含：`providers[]` / `agents[]` / `models[]`（`name` + `action_url`）、`scenes[]`、`barriers[]`，以及标题、摘要、截止时间等。只收录真实公开帖子，不编造。

## 更新流程

猎手扫描 X → 写入 `items.json` → 编辑运行 `build-site.sh` → 推送 `main` → Pages 自动更新
