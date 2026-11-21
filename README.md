# 免费 · Free

模型、编程 Agent、VPS 的免费额度放在同一个静态站里。三个路径：

| 路径 | 内容 |
| --- | --- |
| `/provider/` | 模型、网关、API 额度（原来的 Providers） |
| `/agent/` | 编程 Agent、CLI、IDE 的免费额度（原来的 Agents） |
| `/vps/` | 免费 VPS、DMIT / 搬瓦工补货、黑五优惠 |

`/` 打开 `/provider/`。手机上三个 tab 固定在顶部。

页面标题是「免费 · 模型」「免费 · Agent」「免费 · VPS」。根页面是「免费 · Free」。

## 地址

- Netlify：https://scoheart-free.netlify.app/
- GitHub Pages：仓库改名为 `free` 之后是 https://scoheart.github.io/free/

Vite 使用相对资源路径。同一份构建产物支持域名根路径和 `/free/` 子路径。

## 平台链接

选中的平台写在 **hash** 上，不写成多出来的路径（静态托管没有 `/provider/groq` 这个文件）：

- `/provider/#groq`
- `/agent/#opencode`

带不带目录斜杠都可以。服务器如果把 `/provider` 补成 `/provider/`，hash 会留下来，结果一样。

旧链接会自动换成上面的形式，并保持平台选中：

| 旧 hash | 打开 |
| --- | --- |
| `#providers/groq` | `/provider/#groq` |
| `#agents/opencode` | `/agent/#opencode` |
| `#providers` | `/provider/` |
| `#agents` | `/agent/` |
| `#groq` | 这个平台所在的栏目。两边都有时进 `/provider/` |
| `#opencode` | `/agent/#opencode` |

写错栏目也会纠正：`/agent/#groq` 会到 `/provider/#groq`，因为 Groq 在模型页。`/vps/#providers/groq` 同样会离开 VPS 页。

## 模型数据

`items.json` 是目录源。浏览器直接加载 JSON。字段和原来一样：`claim_guide`、自动领取徽章、截止时间按北京时间显示、过期和被取代的条目隐藏、说明里的密钥打码。分类仍由 `category` / `kind` 决定，不写时按平台名和标题判断。

## VPS 数据

浏览器直接加载 `vps.json`。当 `"sample": true` 时，页面会显示「示例数据，等待首次同步」。下面的生成脚本写入 `"sample": false` 的监控数据。

`vps.json` 顶层：

| 字段 | 含义 |
| --- | --- |
| `schema_version` | 固定 `1` |
| `sample` | `true` 时页面显示示例提示 |
| `updated_at_beijing` | 页头的最后更新时间，取三份扫描时间里最晚的一个 |
| `scanned_at_beijing` | `stock` / `black_friday` / `free_vps` 各自的扫描时间 |
| `free_vps` | 免费 VPS 情报，只保留 `genuine: true` |
| `stock.providers` | 固定两家：DMIT、搬瓦工 |
| `stock.source_notes` | 监控源异常的短说明 |
| `black_friday.official` | 各厂商官方状态 |
| `black_friday.leads` | 第三方线索，页面标明「仅线索，未经官方确认」 |
| `black_friday.date_note` | 日期说明 |

免费条目：`id`、`provider`、`type`（`always_free` / `trial` / `student` / `paas` / `other`）、`type_label`（一直免费、试用额度、学生额度、非 root 的 PaaS）、`specs[]`（`label` + `value`）、`free_conditions`（`card_required`、`card_notes`、`region_limits`、`idle_reclaim`、`deadline`、`deadline_note`）、`official_url`、`posts[]`（`url`、`time_beijing`、`author`、`role`）、`notes`。X 上的帖子显示为「据 X 上的帖子」。

补货套餐：`key`、`display_name`、`config`、`specs[]`、`price`、`stock`（`in_stock` 绿色「有货」，其他灰色「缺货」）、`limited`、`last_restock`、`order_urls[]`（`label` + `url`）。搬瓦工同时给 `bandwagonhost.com` 和 `bwh81.net`。对不上目录时价格和链接留空，页面不会编一个价格。

厂商上还有 `checked_at_beijing`、`official_url`、`sources[]`（`name`、`url`、`checked_at_beijing`）。DMIT 看来源 `vpsrestock.com` 和 `t.me/dmitnews`，搬瓦工看 `vpsrestock.com` 和 `stock.bwg.la`。

黑五官方：`provider`、`status`、`status_label`（现在能下单 / 预告未开卖 / 今年不办）、`status_kind`（`now` / `soon` / `off`）、`orderable_now`、`summary`、`sources[]`、`sale_hub`、`plans[]`（`name`、`price`、`specs`、`url`）。

## 从监控目录生成 vps.json

```bash
python3 scripts/build_vps.py --in /path/to/vps-watch --out vps.json
```

`--in` 里只读这三个文件（`schema_version` 1，时间字段是北京时间 `*_beijing`）：

- `stock-state.json`：`scanned_at_beijing`、`dmit`、`bandwagonhost`。套餐在 `watched_plans`。搬瓦工的价格和下单链接不在套餐上，脚本用 `pid`、`display_name`、`aliases` 去 `catalog_stock_bwg_la` 和 `catalog_vpsrestock` 里对。先对 `pid`，再对规范化后的名字。对不上就留空。
- `bf-seen.json`：`official`、`leads_third_party_only`、`black_friday_2026_date_note`。
- `free-vps-seen.json`：`items`。只输出 `genuine` 为 true 的条目。`dropped` 和 `watch_accounts` 不输出。

同目录的 `signups.json` 不会被打开。缺字段就空着。邮箱、密码、密钥样式的字符串不会写进结果。

然后：

```bash
./build-site.sh
```

## 开发

前端使用 React、TypeScript、Vite 和 Radix UI。页面入口及组件位于 `web/`，CSS 和数据处理逻辑在 `web/src/`。Radix UI 负责平台标签页和领取步骤的折叠交互。

安装 Node.js 22.12 或更新版本，执行以下命令。Python 3 用于 VPS 数据生成和测试。

```bash
npm ci
npm run dev
```

运行 `npm test` 可以验证目录渲染、哈希链接和 VPS 数据生成。

`./build-site.sh` 构建后，把站点 HTML 和带内容哈希的 `site-assets/` 同步到仓库根目录。修改页面时，请编辑 `web/` 下的源文件，再运行构建。

## 部署

```bash
./build-site.sh
npm run preview
```

- GitHub Pages 从 `main` 根目录发布。构建脚本更新根目录的页面和资源文件。
- Netlify 手动发布时，上传整个 `dist/` 目录。关联 Git 的构建使用 `netlify.toml` 配置。

两种部署都提供 `items.json` 和 `vps.json`，并保留 `data.js` 和 `vps-data.js` 供已有消费者加载。根页和栏目跳转使用相对路径，保留原有 hash 链接。Netlify 的 `_redirects` 保留根页跳转和目录斜杠规则。

仅构建 `dist/` 时，可运行 `npm run build` 或兼容入口 `python3 build_index.py`。
