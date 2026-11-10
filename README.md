# 免费模型 · Free Models

汇总公开社区帖子（X、LinuxDo、V2EX 等）中的**免费 AI 模型额度与限时活动**。按 **Provider / Agent / Model** 分类，卡片上可一键跳转创建 API Key、下载 Agent 或查看模型页。

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

每条含：`providers[]` / `agents[]` / `models[]`（`name` + `action_url`）、`scenes[]`、`barriers[]`，以及标题、摘要、截止时间等。只收录真实公开帖子，不编造；免费额度、资格、范围与截止时间优先核对官方条款。第三方转接服务明确标注风险；无法确认的旧条目标记待核实，不臆造截止日。

卡片「如何领取」优先用 `claim_steps`（字符串数组，一条一个步骤）。没有 `claim_steps` 时，页面把 `free_terms`（否则 `summary`）按中文分号 `；`、英文分号 `;` 或换行拆成列表。步骤正文里如果要保留分号，写进 `claim_steps`，不要只放在 `free_terms`。

可选字段 `auto_claim` 记录自动领取结果：`status` 为 `success`、`failed` 或 `needs_user`，`note` 为简短中文说明，`at` 为北京时间字符串。有该字段时，标题旁显示小徽章：已自动领取（绿）、自动申请失败（红）、需要你本人操作（琥珀）；没有该字段则不显示徽章。`note` 显示在徽章下方，过长会截断，`at` 以浅色小字跟在说明下面。页面不展示任何 API Key。`expired` 为真、截止时间已过，或带 `superseded_by` 的条目不会出现在列表里。

## 更新流程

扫描 X / LinuxDo / V2EX 等社区 → 核对官方来源并去重 → 写入 `items.json` → 编辑运行 `build-site.sh` → 推送 `main` → Pages 自动更新
