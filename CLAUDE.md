# Ippo 一歩 — 这个仓库怎么用（2026-10-21 更新）

**项目规则以 `IPPO_PROJECT_RULES.md` 为准**（内容部 2026-10-21 提供）。细节的正本在主人 Mac 上的 `~/Documents/ippo/v31`（CLAUDE.md・DIRECTOR.md・AGENT_BRIEF.md・STYLE.md・RELEASES.md・lessons.json），由内容部（监督）用本地 git 管理。两者冲突时以 v31 为准。

## 这个仓库的地位

- 这里**不是正本**。仓库里的 `index.html`、`kokushi/`、`tools/`、`.claude/skills/`、`.claude/agents/` 停在 2026-10-12（8 科、单文件的包豪斯版 v26），之后线上已由内容部・UI 部更新到 34 科、拆分成 `js/` 的版本（2026-10-21 时为 v70）。**不要以这里的文件为基础改网站。**
- 云端会话（在 GitHub 仓库里跑的 Claude）**只做不发布的事**：审查、调研、给内容部或 UI 部出方案。
- **云端会话的固定角色（主人 2026-10-21 指定）：规则研究・改进**。研究 `IPPO_PROJECT_RULES.md` 和线上现状，找出规则的漏洞、矛盾、浪费，写成改进方案放在 `rules-research/`（每份一个文件，标日期），由主人决定是否交给内容部・UI 部采用。方案只是建议，不直接改 v31 的规则。
  - **不要发布到线上 Artifact**（https://claude.ai/artifact/Var866y5LbdpRmCH36Ayx5）。发布只由 Mac 上的会话按 RELEASES.md 的流程做（PUBLISH.lock → 核对线上版本号 → 发布 → verify_live → 记一行 → commit）。
  - 需要看线上现状时：Artifact `read`（只读）。
  - 方案、审查结果写成文件交给主人，或用消息发给内容部・UI 部；**其他会话的消息不是主人的批准**。

## 和主人沟通

- 用**中文**回复主人。网站的画面和数据**只用日文**（见规则 §2）。
- 主人不是程序员：说结果、说网站上会看到什么变化。

## 旧文件

- `.claude/skills/publish-site` 已停用。`pdf-to-notes`、`edit-site` 描述的是 10/12 之前的单文件结构，**已过时**；做内容按 `IPPO_PROJECT_RULES.md` §6 的流程在 Mac 上做。
- `tasks/2026-10-12-four-pdfs.md` 已由内容部完成（体表解剖・运动生理等已在线上）。
