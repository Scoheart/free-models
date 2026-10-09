# 免费模型 · Free Models

汇总公开 X 帖子中的**免费 AI 模型额度与限时活动**。本仓库托管静态页面，由自动化流程根据 `items.json` 更新。

## 在线页面

GitHub Pages：https://scoheart.github.io/free-models/

## 本地重新生成

```bash
cd /workspace/free-models   # 或本仓库检出目录
./build-site.sh
```

会生成：

- `site/index.html` — 单页静态站（内嵌 `ITEMS` 数据）
- `site/items.json` — 与源数据一致的透明副本

## 数据说明

- 只收录真实公开帖子，不编造条目
- 字段含模型、类型、截止时间、是否过期、原帖链接等
- 页脚声明：数据来自公开 X 帖子，仅汇总不担保可用性

## 更新流程

猎手扫描 X → 写入 `items.json` → 编辑运行 `build-site.sh` → 推送到本仓库 `main` → Pages 自动更新
