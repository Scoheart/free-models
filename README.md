# 免费模型 · Free Models

汇总公开社区帖子（X、LinuxDo、V2EX 等）中的**免费 AI 模型额度与限时活动**。按 **Provider / Agent / Model** 分类，卡片上可一键跳转创建 API Key、下载 Agent 或查看模型页。

## 在线页面

https://scoheart.github.io/free-models/

## 功能

- 左侧按平台分栏：每项显示平台名、进行中的活动数量，以及自动领取状态点（绿 = 有成功，琥珀 = 需要本人操作，红 = 失败，未标记则无点）
- 平台排序：离截止最近的在前，其余按名称
- 搜索框过滤平台名和活动正文
- 右侧是选中平台的活动：标题、截止时间（北京时间）、简介、免费条款、自动领取徽章、去领取，以及编号领取步骤
- 地址栏 hash 记住当前平台（例如 `#groq`），可直接打开
- 手机上平台列表变成顶部的下拉框，并保留可横向滑动的标签条

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

平台名优先用 `platform`。没有该字段时，从领取链接的主机名推断（优先 `providers` / `models` / `agents` 的 `action_url`，跳过 x.com 等帖子来源），再退回条目 `url`。常见主机映射成可读名称，例如 `console.groq.com` → Groq，`aistudio.google.com` → Google AI Studio，`openrouter.ai` → OpenRouter，带 `ai-gateway` 的 vercel.com → Vercel AI Gateway。

领取步骤优先用 `claim_guide`：对象数组，每项含 `step`（短标题）、`detail`（可多句）、可选 `url`、可选 `note`（如需要手机号或绑卡，页面显示为提醒）。没有 `claim_guide` 时用 `claim_steps`（字符串，或字符串数组；字符串按换行拆，只有一行时再按 `；` / `;` 拆）。都没有时，若 `free_terms`（否则 `summary`）能拆成多步，或正文像领取说明，则用作步骤。步骤正文里如果要保留分号，写成数组，不要只放在一个字符串里。

可选字段 `auto_claim` 记录自动领取结果：`status` 为 `success`、`failed` 或 `needs_user`，`note` 为简短中文说明，`at` 为北京时间字符串。有该字段时显示徽章：已自动领取（绿）、自动申请失败（红）、需要你本人操作（琥珀）；没有该字段则不显示徽章。`note` 与 `at` 跟在徽章后面。同一平台只要有一条成功，标签上的状态点就是绿色；否则有待操作则为琥珀，有失败则为红色。页面不展示任何 API Key，说明文字里看起来像密钥的字符串会被替换成 `[redacted]`。`expired` 为真、截止时间已过，或带 `superseded_by` 的条目不会出现。

## 更新流程

扫描 X / LinuxDo / V2EX 等社区 → 核对官方来源并去重 → 写入 `items.json` → 编辑运行 `build-site.sh` → 推送 `main` → Pages 自动更新
