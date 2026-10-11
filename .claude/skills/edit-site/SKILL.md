---
name: edit-site
description: 修改 Ippo 网站的功能、外观、文字或修 bug（不是加 PDF 内容）。主人说「改一下网站」「这个按钮」「颜色/排版」「有个地方坏了」「加个功能」时使用。
---

# 改网站

先读 `CLAUDE.md`。`index.html` 很大，绝不整份读。

1. **弄清要改什么**：主人描述得模糊时，先用 Playwright 打开网页截图，指着截图确认是哪里。
2. **定位**：`grep -n` 搜界面上看到的文字、class 名或 id，找到对应的 CSS / HTML / JS。注意各科目マップ的 HTML 和 CSS 是写在 JS 字符串里的（`const HTML="..."`、`EXTRA_CSS`），里面的 `"` 和换行是转义过的。
3. **改**：只改需要改的；颜色用 `:root` 里已有的变量（`--seiji`、`--yamabuki`、`--toki` 等），深色模式也要好看。手机宽度（375px）下不能横向滚动。
4. **验证**：
   - `node tools/check.mjs` 全部通过
   - Playwright 截图：改动前后、电脑宽度和手机宽度、浅色和深色模式
5. **交付**：中文说明改了什么，附截图。主人确认后提交推送，再问要不要 `publish-site`。

注意：学习进度存在浏览器 localStorage 和 Artifact 的 `db` 里，改数据结构（比如卡片 id、topic id）会让主人已有的进度对不上——改之前先告诉主人。
