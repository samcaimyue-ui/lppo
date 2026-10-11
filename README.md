# lppo — Ippo 一歩

A website for rehab students：理学療法士国家試験（第45〜61回）的刷题 / 复习网站。

原版发布在 Claude Artifact：https://claude.ai/artifact/Var866y5LbdpRmCH36Ayx5

## 文件结构

- `index.html` — 整个网站（HTML + CSS + JS 都在这一个文件里）
- `kokushi/45.json` … `kokushi/61.json` — 各回国家试验的题目数据，网页按需加载

## 本地运行

网页需要通过 HTTP 加载 `kokushi/*.json`，不能直接双击打开，请启动一个本地服务器：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 与 Claude Artifact 版本的区别

在 Artifact 里，网站会用到 Claude 的运行时功能（`window.claude.use('db')` 云端同步进度、`window.claude.use('sample')` 让 Claude 生成内容）。
在这里独立运行时这些功能不可用，代码会自动退回：学习进度只保存在本机浏览器里，AI 相关功能不可用。
