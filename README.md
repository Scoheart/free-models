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

资源都用相对路径（`../styles.css`、`provider/`、`agent/`）。同一套文件可以放在域名根上，也可以放在 `/free/` 下面。

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

`items.json` 仍是目录源，页面读生成出来的 `data.js`（`const ITEMS`）。字段和原来一样：`claim_guide`、自动领取徽章、截止时间按北京时间显示、过期和被取代的条目隐藏、说明里的密钥打码。分类仍由 `category` / `kind` 决定，不写时按平台名和标题判断。

## VPS 数据

页面读 `vps-data.js`（`const VPS`），由 `vps.json` 生成。仓库里的 `vps.json` 带 `"sample": true`，页面会显示「示例数据，等待首次同步」。真实数据在本地用下面的脚本盖掉 `vps.json`，再重新构建。脚本写出的文件是 `"sample": false`。

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

## 部署

`./build-site.sh` 生成 `dist/`。把这个目录整个上传到 Netlify（站点 scoheart-free，手动部署，不是 Git 构建）。脚本也会把同样的文件抄到仓库根目录，方便 GitHub Pages 继续从 main 分支的根目录发布。

需要发布的文件就是 `dist/` 里的这些，不要带上 `templates/` 或 `scripts/`：

```
index.html
provider/index.html
agent/index.html
vps/index.html
app.js
styles.css
data.js
vps-data.js
items.json
vps.json
_redirects
.nojekyll
```

`_redirects` 把 `/` 强制转到 `/provider/`，并把三个栏目补上斜杠。GitHub Pages 不读这个文件，根目录的 `index.html` 负责同一件事。`.nojekyll` 让 Pages 不要吞掉 `_redirects`。

本地看：

```bash
./build-site.sh
python3 -m http.server -d dist 8765
```

要模拟 Pages 的 `/free/` 前缀，把 `dist` 放到一个叫 `free` 的目录下再开静态服务，然后打开 `/free/provider/`。
