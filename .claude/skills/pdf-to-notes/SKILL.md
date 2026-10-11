---
name: pdf-to-notes
description: 把主人拍的讲义/教科书 PDF 做成 Ippo 网站内容（マップ的讲义笔记、因果图节点、暗記卡片）。主人说「这份 PDF 做进网站」「加一章」「把这几页整理一下」或给了 PDF 时使用。
---

# PDF → 网站内容

先读 `CLAUDE.md` 里的数据格式说明。

## 1. 拿到 PDF，问清楚放哪

- PDF 可能在：对话附件、`pdfs/` 文件夹、或主人的 Google Drive（用 Drive 搜索/下载，存进 `pdfs/`）。
- 确认三件事（主人没说就问，一次问完）：
  1. 放进**哪个科目**（8 个マップ之一，或新建科目）
  2. 是**新 topic**，还是补充已有 topic
  3. 要不要同时做**暗記卡片**
- 先看一遍 PDF 的目录/页数，告诉主人你打算怎么分 topic、每个 topic 对应哪几页，主人点头再动手。

## 2. 读 PDF、整理内容

- 拍的 PDF 多半是图片：用 Read 按页读（`pages` 参数，每次最多 20 页），看清楚再写，看不清的字标 `【?】` 并告诉主人页码。
- 页数多（超过 20 页）时，交给 `note-extractor` 子代理分段整理，每段一份草稿。
- 每个 topic 产出：
  - `NOTES` 条目：章节标题（日/中）、每章 3〜6 条要点（日文，忠实原文，可精简）
  - 关键概念的节点（日文名、中文名、一句话、说明、分类 cat）
  - 节点之间的箭头（导致 / 缓解 / 评估 / 恶性循环），只连 PDF 里讲到的因果
  - `TOPICS` 目录条目、`FOLDERS` 页码范围、`TOPIC_INFO` 导读
  - （需要时）暗記卡片：题目问日文定义或关键词，答案日文 + 中文

## 3. 校对

- 把草稿交给 `medical-checker` 子代理，对照 PDF 原文检查：事实错误、漏掉的重点、翻译错误。
- 按它的意见改好。拿不准的地方列出来问主人。

## 4. 写进 index.html

- 用 `grep -n` 找到目标科目块里的 `NOTES`、`TOPICS`、`FOLDERS`、节点区、`TOPIC_INFO`，**照该科已有写法**插入。
- 暗記卡片：用 Python 读出 `window.IppoDrill=` 那一行 → `json.loads` → 加 deck / cards（id 不能重复，格式 `前缀-随机串`）→ `json.dumps(ensure_ascii=False, separators=(',',':'))` 写回。
- 运行 `node tools/check.mjs`，必须全部通过。
- 用 Playwright 打开网页，切到该科目、点开新 topic 截图，确认图和笔记都显示出来了。

## 5. 交付

- 用中文告诉主人：加了哪些 topic / 多少节点 / 多少卡片，哪些地方拿不准，附截图。
- 主人确认后：提交并推送；问主人要不要用 `publish-site` 发布到线上。
