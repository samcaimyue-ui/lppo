# Ippo 一歩 — 团队手册

理学療法（物理治疗）学生的复习网站。主人把自己拍的讲义 / 教科书 PDF 交给我们，我们把内容做成网站里的「マップ」（因果图 + 讲义笔记）和「暗記」卡片。
线上版本是 Claude Artifact：https://claude.ai/artifact/Var866y5LbdpRmCH36Ayx5

## 和主人沟通

- 用**中文**回复主人。网站内容本身是**日文原文 + 中文翻译**（主人在日本读 PT 学校，考的是日本国试）。
- 主人不是程序员：说结果、说网站上会看到什么变化，不要堆代码细节。

## 文件

- `index.html`：整个网站，单文件，约 3.8MB。**不要整份读**，用 `grep -n` 定位再按行读。
- `kokushi/45.json` … `61.json`：第 45〜61 回国试题，网页按需 `fetch`。
- `tools/check.mjs`：自检。**每次改完都要跑** `node tools/check.mjs`，不通过不能提交。
- `pdfs/`：主人的 PDF 放这里，已加入 `.gitignore`，**不要提交**（仓库是公开的，教材有版权）。

## index.html 里的科目（每科一个 `<script>` 块）

用 `grep -n 'window.IppoMap' index.html` 找到各块的位置（行号会变，别写死）。

| 科目 | 对象名 | 网页容器 |
|---|---|---|
| 運動器疾患マップ（前期運動器疾患治療学） | `IppoMap` | `#mapHost` |
| 中枢神経マップ | `IppoMapCNS` | `#cnsHost` |
| 病理総論マップ | `IppoMapBYO` | `#byoHost` |
| 内科各論マップ | `IppoMapNAI` | `#naiHost` |
| 生理学マップ | `IppoMapSEI` | `#seiHost` |
| 基礎運動療法マップ | `IppoMapKIS` | `#kisHost` |
| 理学療法評価演習 | `IppoMapHYO` | `#hyoHost` |
| 整形外科 | `IppoMapORT` | `#ortHost` |

每个科目块里都有 `NOTES`、`FOLDERS`、`TOPICS`、`NODES`、`TOPIC_INFO`。**节点的写法各科不一样**：運動器・中枢神経用对象字面量 `{id,topic,x,y,cat,ja,zh,desc}`（带坐标），病理総論等用 `N(...)`，整形外科用 `NM(...)`。往哪科加内容，就**照那一科已有的写法**。以整形外科为例：

- `NOTES`：讲义笔记。`topicId:{t:"日文标题", z:"中文标题", src:[["资料名",页]], s:[ 章节… ]}`
  每个章节：`["日文小标题","中文小标题",["要点1","要点2",…],"节点id:要点序号 …"]`，最后一项把要点挂到图上的节点。
- `FOLDERS`：PDF 的页码范围 → 对应哪些 topic，例如 `["関節リウマチ(p14〜25)",11,[["ra",3],["rarx",4]]]`。
- `TOPICS`：左侧目录。`{grp:"分组名"}` 是分组标题，`{id,label}` 是条目。
- `NM("id","topic","cat","日文名","中文名","一句话","说明")`：图上的节点。`cat` 是分类：`mech` 外力・負荷 / `tissue` 構造 / `path` 疾患・病態 / `comp` 合併症 / `imp` 障害 / `tx` 治療 / `dx` 評価。
- `E("a>b c~d e?f g@h")`：箭头。`>` 导致（harm）、`~` 缓解、`?` 评估、`@` 恶性循环。
- `TOPIC_INFO`：每个 topic 的导读，`TI("分组","标题",\`<p class="intro">…</p>\`)`。

「暗記」卡片在 `window.IppoDrill=` 那一行（JSON，一整行很长）：
- `order`：牌组顺序；`decks.<id> = {t:"日文名", g:"所属分组", secs:[["日文章节","中文章节"],…]}`
- `cards`：`["唯一id","牌组id",章节序号,"题目(日文)","答案(日文)","中文"]`

## 规矩

1. **内容只来自主人的 PDF**。PDF 里没有的不要编；需要补充常识时，告诉主人并标明是补充。
2. 日文术语照 PDF 原文写，中文翻译要准确（医学用语用大陆通用译法）。
3. 改超长的一行（`IppoDrill`、`IppoMap` 那几行）时，用 Python 脚本读取→修改→写回，不要手动拼字符串。
4. 只改需要改的地方，不顺手重写别的科目。
5. 改完：`node tools/check.mjs` 通过 → 告诉主人改了什么 → 主人同意再提交、推送、发布。

## 可用技能

- `pdf-to-notes`：把 PDF 做成网站内容（最常用）
- `edit-site`：改网站的功能或外观
- `publish-site`：把 `index.html` 发布到线上 Artifact
