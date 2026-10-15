# 番茄钟 + 任务清单

全栈学习路线的**项目 1**（第 1-2 周）。目标不是做出多复杂的东西，而是把 React 的核心概念
真正写一遍：组件、JSX、props、state、事件、列表、不可变更新、派生数据、受控组件、`useEffect`。

## 技术栈

| 项 | 选择 |
|---|---|
| 构建工具 | Vite 6 |
| 框架 | React 19 |
| 语言 | TypeScript 5.8 |
| 样式 | 普通 CSS（没用 Tailwind） |

## 本地运行

```bash
npm install
npm run dev        # http://localhost:5173
```

其他命令：

```bash
npm run build      # 生产构建（含 TypeScript 类型检查）
npm run preview    # 本地预览生产构建产物
npm run lint       # 代码规范检查
```

## 功能

**番茄钟**

- 25 分钟倒计时，可开始 / 暂停 / 重置
- 归零自动停止

**任务清单**

- 添加（受控表单，回车或点按钮都能提交）
- 打勾切换完成状态
- 删除
- 按「全部 / 未完成 / 已完成」筛选，带数量统计
- 空列表提示

**数据持久化**

- 任务数据存在 `localStorage`，刷新页面不丢
- 读取时做了两层兜底（解析失败 / 不是数组都退回初始数据）

## 项目结构

```
src/
├── main.tsx      入口：把 <App /> 挂到 #root
├── index.css     全局样式
├── App.tsx       组件 + 逻辑
└── App.css       App 的样式
```

`src/App.tsx` 里的概念分布（按建议的阅读顺序）：

| 位置 | 概念 |
|---|---|
| `type Task` / `type Filter` | 用类型先把数据结构描述清楚 |
| `loadTasks()` | `useState` 惰性初始化、读外部数据要兜底 |
| `useState(...)` 三行 | state 声明 |
| `toggleTask` / `addTask` / `deleteTask` | 不可变更新三件套：`map` / `[...prev]` / `filter` |
| `doneCount` / `visibleTasks` / `countOf` | 派生数据（现算，不存 state） |
| `useEffect` × 3 | 定时器+清理函数、监听值变化、同步到外部存储 |
| `TaskItem` | 组件拆分、props、事件向上抛 |

## 踩过的坑（这部分才是最有价值的）

| # | 现象 | 原因 | 修法 |
|---|---|---|---|
| 1 | 加持久化后，连加几条再刷新，控制台报 `Encountered two children with the same key` | `idCounter` 是模块级变量，只在页面加载时初始化一次，不知道 localStorage 里最大的 id 是多少 | 不再维护独立计数器，改成从当前数据现算：`Math.max(0, ...prev.map(t => t.id)) + 1` |
| 2 | 试图用 `prev.length + 1` 当新 id，删过任务后仍然重复 | **`length` 是个数，不是最大的 id**。删掉中间一条，两者就脱节了 | 同上，从数据算最大 id |
| 3 | 解析坏掉的数据会导致整页白屏 | 组件渲染过程中抛错会炸掉整个 React 树 | 读外部数据一律 `try / catch` + 类型检查，失败就退回默认值 |
| 4 | 删掉 `clearInterval` 后，暂停停不住、再开始一秒减 2 | `useEffect` 忘了返回清理函数，旧定时器一直在跑 | `return () => clearInterval(timerId)` |
| 5 | `formatTime` 里留了一行永远执行不到的 `return` | 写完新实现忘了删旧实现 | 检查 `return` 之后是否还有代码 |
| 6 | 在 `setSecondsLeft` 的更新函数里调用了 `setIsRunning` | 更新函数必须是纯函数（React 有权调用多次） | 拆成独立的监听 effect |

**反复出现的一条原则**：不要维护"和数据脱节的副本"。
坑 1、坑 2 是同一个错误（独立计数器），坑 3 是第一周"派生数据不要存成 state"的同一条原则。

## 部署

静态站点，构建产物在 `dist/`，可以直接放到任何静态托管（Vercel / Netlify / GitHub Pages）。

注意：如果托管平台让你指定项目根目录，要填 `projects/01-pomodoro`（因为仓库里还有别的项目）。

## 已知限制

- 数据存在浏览器本地，**换设备不共享**（手机上打开是空的）
- 开多个标签页同时操作会互相覆盖（各自的 `tasks` 在内存里，谁后写谁生效）

这两条都是"浏览器本地存储"的固有特点，需要多端同步时就得引入后端 —— 那是学习路线里项目 2、3 的内容。
