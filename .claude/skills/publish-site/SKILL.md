---
name: publish-site
description: 把仓库里的 Ippo 网站发布到线上 Claude Artifact（主人平时用的那个网址）。主人说「发布」「更新线上」「同步到网站」时使用。
---

# 发布到线上

线上地址：https://claude.ai/artifact/Var866y5LbdpRmCH36Ayx5

1. `node tools/check.mjs` 必须通过；工作区改动已经提交。
2. 先用 Artifact 工具 `read` 一次线上版本。如果线上有仓库里没有的改动（主人可能在别处改过），先告诉主人，商量好再继续，不要覆盖。
3. 发布：Artifact `publish`，`url` 填上面的地址，`file_path` 是 `index.html`。
   - 题库 `kokushi/*.json` 只有改过的才放进 `files`（没传的文件线上会保留）。
   - 不要传 `capabilities`（保留线上已有的 `db`、`sample`，主人的进度同步靠它）。
4. 告诉主人已发布，请主人打开网址看一下。
