# React 基础讲义（第 1 周）

> **项目**：番茄钟 + 任务清单（学习项目 1）
> **技术栈**：Vite + React 19 + TypeScript（样式用普通 CSS）
> **本周产出**：一个可增、删、改、查、筛选的任务清单应用
> **日期**：2026-10-11 ~ 10-13

---

## 0. 怎么用这份讲义

这份讲义是"第 1 周"的完整复习材料，按**概念 → 代码 → 陷阱 → 练习**的顺序组织。

建议用法：

1. **从头顺读一遍**，遇到看不懂的概念先记下编号，别停下来死磕
2. **对着第 17 节的完整代码读**，每个概念都能在里面找到对应位置
3. 做第 18 节的练习，**先自己写，再看答案**
4. 用第 19 节的自测题检查自己，答不上来的回去看对应章节
5. 卡住时查第 16 节的"常见错误清单"——大部分问题都在那里

---

## 1. 本周学习目标

学完之后，你应该能独立回答这些问题：

- React 和直接操作 DOM 有什么本质区别？
- 组件是什么？为什么函数名必须大写开头？
- JSX 和 HTML 有哪 4 处不同？
- `props` 为什么是只读的？子组件想改数据怎么办？
- `useState` 返回的两个东西是什么？为什么不能直接改第一个？
- 为什么 `push` 数组界面不会更新？
- `key` 是干什么的？为什么不能用数组下标？
- 什么是"派生数据"？为什么不能存成 state？
- 调用 `setState` 之后，哪些东西会重新渲染？

---

## 2. 环境与工具链

| 工具 | 它是什么 | 你需要知道的 |
|---|---|---|
| **Node.js** | 让 JS 能脱离浏览器运行的环境 | 前端工具链都跑在它上面。装 20 以上版本 |
| **npm** | 包管理器 | `npm install` 装依赖，`npm run xxx` 跑脚本 |
| **Vite** | 开发服务器 + 打包工具 | `npm run dev` 启动，改代码浏览器自动刷新（热更新） |
| **TypeScript** | JS + 类型系统 | 写错字段名、类型不匹配会**立刻报错**，不用等运行 |
| **React** | UI 库 | 本周的主角 |
| **CSS** | 样式 | 本周用普通 CSS（`.task-item { display: flex }` 这种） |

### 项目结构

```
01-pomodoro/
├── index.html          页面外壳，只有一个 <div id="root"></div>
├── package.json        依赖清单 + 命令定义
├── vite.config.ts      Vite 配置（注册 React 插件）
├── tsconfig.json       TypeScript 配置
└── src/
    ├── main.tsx        入口：把 <App /> 挂到 #root 上
    ├── index.css       全局样式（body 背景、字体）
    ├── App.tsx         组件 + 逻辑  ← 主要看这个
    └── App.css         App 的样式
```

### 常用命令

```powershell
npm install        # 第一次拉下代码后，装依赖
npm run dev        # 启动开发服务器，浏览器打开 http://localhost:5173
npm run build      # 生产构建（同时做 TypeScript 类型检查）
npm run lint       # 代码规范检查
```

> **注意**：改代码后**不需要重启** `npm run dev`，Vite 会自动刷新页面。只有在改了配置文件（`vite.config.ts`、`package.json`）或装了新依赖时才需要重启。

---

## 3. React 解决什么问题

### 不用 React 时，你得手动操作 DOM

```js
// 新增一条任务
const li = document.createElement('li')
li.textContent = '新任务'
document.querySelector('.task-list').appendChild(li)

// 打勾
taskEl.classList.add('done')

// 更新计数
document.querySelector('.counter').textContent = `${count} / ${total}`
```

**真正的危险不是代码啰嗦，而是：数据一变，你必须记得去更新所有受影响的地方。**

这个任务有 3 个地方依赖 `task.done`：

1. 右上角的计数
2. 勾选框的颜色
3. 任务文字的删除线

漏掉任何一处，界面就和数据对不上了。这就是 jQuery 时代 bug 的主要来源。

### React 的思路

> **你只描述"界面应该长什么样"，至于怎么改 DOM，交给 React。**

```jsx
<ul>
  {tasks.map((task) => <li>{task.title}</li>)}
</ul>
```

你只说"这里有 N 条任务，每条显示 title"。**"新增一条时该在哪里插 DOM"这种问题，你永远不用想。**

---

## 4. 概念 1：组件 = 返回标签的函数

```tsx
export default function App() {
  return <div className="app">...</div>
}
```

`App` 就是一个普通函数，只是它 `return` 的东西长得像 HTML。

**两条硬规则：**

1. **函数名必须大写开头**（`App`、`TaskItem`）。小写了 React 会当成 HTML 原生标签处理，界面会莫名空白，而且不报错。
2. **一个组件只能返回一个根元素**。想返回多个就在外面包一层 `<div>`，或者用 `<></>` 空标签。

`export default` 表示"这个文件的默认导出"，`main.tsx` 用它来渲染。

---

## 5. 概念 2：JSX 四条规则

JSX 看起来像 HTML，但它其实是 JS 的语法糖。**四点和 HTML 不一样：**

| 区别 | HTML 写法 | JSX 写法 | 为什么 |
|---|---|---|---|
| CSS 类名 | `class="app"` | `className="app"` | `class` 是 JS 保留字 |
| 事件 | `onclick` | `onClick` | React 用驼峰命名 |
| 自闭合 | `<input>` | `<input />` | 必须显式闭合 |
| 插值 | 无 | `{表达式}` | 插入 JS 的值 |
| 注释 | `<!-- -->` | `{/* */}` | 注释也是 JS |

---

## 6. 概念 3：用 `{}` 插入数据

```tsx
<span className="app-counter">
  {doneCount} / {tasks.length} 已完成
</span>
```

`{}` 里可以写**任何 JS 表达式**：变量、运算、函数调用、三元判断。

**关键限制：`{}` 里不能写语句（`if`、`for`、`const x = ...`），只能写表达式。**

想条件渲染就用三元或 `&&`：

```tsx
{task.done ? '✓' : ''}
{isLoading && <p>加载中...</p>}
```

---

## 7. 概念 4：列表渲染与 `key`

```tsx
<ul className="task-list">
  {visibleTasks.map((task) => (
    <TaskItem key={task.id} task={task} onToggle={toggleTask} />
  ))}
</ul>
```

**React 里没有"循环模板"，列表就是数组的 `map`**：把一个"数据数组"变成一个"组件数组"。

### `key` 是干什么的

`key` 是给 React 看的"身份证"，作用是**让 React 在重新渲染时认出"哪个元素还是原来那一个"**。

> **不要用数组下标当 key。**
>
> 用下标的话，删掉第一条之后，原来的第二条会变成"第 0 项"，React 会认为你改的是第一条，导致勾选状态错乱、输入框内容串位。
>
> `key` 必须是**稳定且唯一**的，所以用数据库 id 或 UUID。

---

## 8. 概念 5：props 与数据流

```tsx
// 父组件：把数据当属性传下去
<TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />

// 子组件：用解构接收
function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
```

**props 是只读的**，子组件不能修改它。那子组件想改数据怎么办？

**让父组件把"修改函数"也传下来。**

```
数据往下传（task）           事件往上传（onToggle / onDelete 回调）
App ────────────────────────→ TaskItem
    ←────────────────────────
```

这就是 React 的核心数据流：**数据向下流，事件向上抛**。

### 为什么不让子组件自己改

子组件只知道自己拿到的 `props`，它**不知道该删哪一条、该改哪一个**。所以正确做法是：

**谁的数据谁负责改** —— 子组件只负责把 `id` 报上去，父组件负责改。

```tsx
// 子组件：只上报，不修改
<button onClick={() => onDelete(task.id)}>删除</button>
```

---

## 9. 概念 6：state 与 `useState`（React 的心脏）

```tsx
const [tasks, setTasks] = useState<Task[]>(initialTasks)
const [draft, setDraft] = useState('')
const [filter, setFilter] = useState<Filter>('all')
```

### 拆解这一行

```js
const [tasks, setTasks] = useState(initialTasks)
      ↑        ↑              ↑
   当前值    修改它的唯一方式   初始值
```

`useState` 返回一个长度为 2 的数组，`const [a, b] = ...` 是 JS 的**数组解构**。

### 为什么必须用 `setTasks`

**React 是靠"你调用了 set 函数"这个信号，才知道要重新渲染。**

```
你调用 setTasks(新值)
  → React 记下新值
  → 重新执行 App() 这个函数
  → 函数返回一份新的 JSX
  → React 对比新旧 JSX，只把有差异的 DOM 换掉
```

**核心结论一句话：**

> **界面 = 组件函数的返回值。函数重新跑一次，界面就更新。**

### 重新渲染的范围（重要，很多人理解错）

| 阶段 | 范围 |
|---|---|
| **重新渲染**（re-render） | **整个组件函数重新执行**，全量重算 |
| **更新 DOM**（commit） | **只把有差异的部分**写进真实 DOM，增量更新 |

所以不是"只有相关的视图重新渲染"。你在输入框敲一个字，`visibleTasks` 明明和它无关，**也会被重算一遍**。

**那为什么性能没问题？** 因为 React 的设计逻辑是：**把"便宜的 JS 计算"换成"最少的 DOM 操作"**。执行函数是微秒级，而操作真实 DOM 会引起浏览器重排重绘，可能慢几十倍。

**重要推论：父组件重新渲染时，所有子组件默认也会重新渲染**，哪怕 props 一个字没变。当前规模下无所谓，等列表几千条时才需要 `React.memo`。

### 什么时候 React 会跳过渲染

**如果你 set 的新值和当前值完全相同**（用 `Object.is` 比较），React 认为"什么都没发生"，跳过这次渲染。

> 这一点能解释一个常见困惑：`setFilter('all')` 在 `filter` 已经是 `'all'` 时**界面纹丝不动**。不是按钮坏了，是 React 主动认为"这次更新没有意义"。

### 什么时候该用 state

拿到一个数据，问自己三句：

1. **它会随时间变化吗？** 不变 → 普通常量，连 `useState` 都不用
2. **它能由别的 state 算出来吗？** 能 → 派生数据，不要存
3. **它是 props 传进来的吗？** 是 → 通常也不该复制成 state

三句都是"否"，才轮到 `useState`。

---

## 10. 概念 7：事件处理

```tsx
<button type="button" onClick={() => onToggle(task.id)}>
```

`onClick` 后面跟的是一个**函数**（不是调用结果）。

- `() => onToggle(task.id)` = "点击时才执行这一句"
- `onToggle(task.id)` = **渲染时立刻执行**（错误写法）

需要传参数时（这里要传 `task.id`），就必须用箭头函数包一层。

---

## 11. 概念 8：不可变更新（最容易写错的地方）

```tsx
function toggleTask(id: number) {
  setTasks((prev) =>
    prev.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task,
    ),
  )
}
```

这里**没有修改任何已有的东西，而是造了一个新数组**。为什么要这么麻烦？

因为 React 判断"数据变没变"用的是**引用比较**——只能看出"是不是同一个对象"。

你写 `task.done = true`，数组还是那个数组、对象还是那个对象，React 一看"引用没变"，**直接跳过渲染，界面就不动**。

> 这个 bug 特别迷惑人，因为 `console.log` 打出来数据明明是**对的**。

### 增删改三件套（背下来，覆盖 90% 场景）

| 操作 | 写法 | 返回的数组 |
|---|---|---|
| **改**某一项 | `prev.map(x => x.id === id ? { ...x, 字段: 新值 } : x)` | 长度不变 |
| **删**某一项 | `prev.filter(x => x.id !== id)` | 长度变短 |
| **增**一项 | `[...prev, 新项]` | 长度变长 |

**理解要点：三个方法的区别就是"返回数组的长度会不会变"。**

- `map` 的回调必须 return **一个元素**（"把它变成什么"）
- `filter` 的回调必须 return **布尔值**（"它要不要留下"）

### 为什么用 `(prev) => ...` 函数形式

两种写法在简单场景下效果一样，但函数形式能保证你拿到的是**最新**的值，而不是本次渲染开始时捕获的旧值。

**规律：只要新状态依赖旧状态，就无脑用函数形式。**

### 严格比较 `!==` 而不是 `!=`

```js
'1' == 1    // true   ← 字符串和数字居然判等
'1' === 1   // false  ← 严格比较，符合直觉
```

将来接后端接口时，id 可能是字符串也可能是数字，`==` 会埋下很难查的 bug。

---

## 12. 概念 9：派生数据（本周最重要的一课）

### 什么是派生数据

任何数据都能分成两类：

| 类别 | 定义 | 例子 |
|---|---|---|
| **原始数据**（state） | 你**存**进去的，算不出来 | `tasks`、`draft`、`filter` |
| **派生数据** | 能从原始数据**算**出来的 | `doneCount`、`visibleTasks` |

```tsx
// 派生数据：每次渲染时现算，不是 state
const doneCount = tasks.filter((task) => task.done).length
```

### 为什么不能存成 state

**用一个生活类比：** 健康 App 上显示"体重"和"BMI"。

你把体重从 80 改成 90，但 BMI 还是 24.7——**因为 BMI 是"存起来的"**，存储时是 24.7，没人去改它，它就永远停在 24.7。

如果 BMI 是**算出来的**，体重一变它就自动跟着变。

### 存成 state 会发生的具体 bug

假设你写成：

```tsx
const [tasks, setTasks] = useState(initialTasks)
const [filter, setFilter] = useState<Filter>('all')
const [visibleTasks, setVisibleTasks] = useState<Task[]>(initialTasks)  // ← 第二份真相

function changeFilter(next: Filter) {
  setFilter(next)
  setVisibleTasks(                       // ← 手动同步
    next === 'all' ? tasks
    : next === 'active' ? tasks.filter((task) => !task.done)
    : tasks.filter((task) => task.done),
  )
}
```

**看起来完全正确，切换筛选也确实生效。** 然后依次爆雷：

**症状 1：** 在「未完成」视图里勾选一条任务 → **那条任务不消失**。

- 因为 `toggleTask` 只改了 `tasks`，`visibleTasks` 没被改
- 而 `<ul>` 渲染的是 `visibleTasks`，它是 state，**没人调用 setter 它就不会变**
- 正确行为应该立刻消失

**症状 2：** 在「已完成」视图里删掉一条任务 → 界面还显示那条**已经不存在的任务**，点它没反应。这是真正的数据不一致。

**症状 3：** 为了修上面两个，你在 `toggleTask` / `addTask` / `deleteTask` 里各加一行同步代码 → **同一个规则被复制到 4 个地方**。下周加"排序"功能时，这 4 处都得改，漏一个就是新 bug。

**这就是项目失控的起点**——不是因为代码丑，而是因为**正确性依赖于"你每次都没忘"**。

### 另一个独立的坑

`useState(tasks)` 的初始值**只在首次渲染时用一次**。之后 `tasks` 怎么变，它都不会跟。所以将来初始数据改成"从后端拉取"时，它会永远停在第一次那批数据上。

### 正确做法

```tsx
const visibleTasks = tasks.filter((task) => {
  if (filter === 'active') return !task.done
  if (filter === 'done') return task.done
  return true
})
```

它是一条**普通的 `const` 语句**，不是 `useState`。

```
tasks（真相 1）  +  filter（真相 2）
                ↓  每次渲染时现算
            visibleTasks
                ↓
             界面渲染
```

`visibleTasks` 是**两个 state 的组合投影**。无论哪一个变了，重新渲染时它自动就是对的——**"同步"这件事根本不存在**。

### 一句话总结

> **同一份信息，只允许有一个存放处。存两份，就迟早对不上——而且你永远不会知道是哪一次忘的。**

### 验证方法

点「未完成」→ 给列表里第一条打勾 → **它应该立刻从列表里消失**。

而 `toggleTask` 里**一行代码都不需要**为它写。这个"消失"就是派生数据正确的证据。

---

## 13. 概念 10：受控组件

```tsx
<input
  className="task-input"
  value={draft}
  onChange={(event) => setDraft(event.target.value)}
  placeholder="添加一个新任务，回车确认"
/>
```

`value` + `onChange` 这两行加起来就叫**受控组件**，形成一个闭环：

```
你敲键盘 → onChange 触发 → setDraft 写入新值 → 重新渲染 → 输入框显示新值
```

看起来绕了一圈（明明输入框自己就能显示字），但换来一个巨大的好处：**`draft` 永远是唯一真相**。

所以清空输入框只需要 `setDraft('')`，一行代码，完全不用操作 DOM。要做输入校验、格式化、限制长度，也都是改 state 就行。

> **对比"非受控组件"**：只用 `defaultValue`，不绑 `onChange`。那种写法读值必须去摸 DOM，代码会散得到处都是。**React 里默认优先用受控组件。**

---

## 14. 概念 11：条件渲染与空状态

```tsx
{visibleTasks.length === 0 ? (
  <p className="task-empty">没有符合条件的任务</p>
) : (
  <ul className="task-list">...</ul>
)}
```

如果一条都没有，与其显示一片空白让用户以为坏了，不如给一句话。

**这是 UX 的基本功：永远不要让用户面对"不知道发生了什么"的空白。**

---

## 15. 概念 12：字面量联合类型 + 数据驱动 UI

### 字面量联合类型

```tsx
type Filter = 'all' | 'active' | 'done'
```

意思是"只能取这三个字符串之一"。

**好处**：写 `setFilter('Active')`（大写 A）时 TypeScript **立刻报错**，而不是等运行时发现筛选永远不生效。编辑器还会自动补全这三个值。

**让工具替你把关，比靠记忆可靠。**

### 数据驱动 UI

```tsx
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'done', label: '已完成' },
]
```

三个筛选按钮长得几乎一样，只有文字和值不同。**这种情况不要把 JSX 手写三遍**——把差异抽成数据，然后 `map` 出来。

```tsx
{FILTERS.map((item) => (
  <button
    key={item.value}
    className={
      filter === item.value
        ? 'filter-button filter-button--active'
        : 'filter-button'
    }
    onClick={() => setFilter(item.value)}
  >
    {item.label} {countOf(item.value)}
  </button>
))}
```

**好处**：以后要加第四个筛选项（比如"今天到期"），只需要在 `FILTERS` 数组里加一行，JSX 一个字都不用改。

### 条件样式

注意 `filter === item.value ? 'A B' : 'A'` —— **算出一个类名字符串**，这就是 React 里做条件样式的标准做法。

---

## 16. 常见错误清单

改代码后界面不对，先在这里找症状。

| 症状 | 原因 | 修法 |
|---|---|---|
| 界面一片空白，控制台无报错 | 组件名小写开头，被当成 HTML 标签 | 改成大写开头 |
| 报错 `Adjacent JSX elements must be wrapped` | 组件返回了多个根元素 | 外面包 `<div>` 或 `<>...</>` |
| `class` 样式不生效 | JSX 里写了 `class` | 改成 `className` |
| 点了按钮**完全没反应** | 1）`onClick={fn(x)}` 渲染时就执行了<br>2）set 的值和旧值相同被 React 跳过 | 1）改成 `onClick={() => fn(x)}`<br>2）检查 set 的值是否真的变了 |
| 数据变了但**界面不动** | 用了 `push` / 直接改属性，没造新数组/新对象 | 改成 `map` / `filter` / `[...prev]` / `{...obj}` |
| 删掉一条后**勾选状态错乱** | `key` 用了数组下标 | 换成稳定的唯一 id |
| 添加任务后**页面闪一下，刚加的没了** | `<form>` 没写 `event.preventDefault()` | 加上 |
| 能添加出**看不见的空任务** | 没做 `trim()` 判空 | 加 `if (title === '') return` |
| 子组件**改不了**父组件的数据 | 只传了数据，没传修改函数 | 把 `setXxx` 或封装好的函数当 prop 传下去 |
| 两个数字**对不上**（如计数和列表） | 存了派生数据，某一处忘了同步 | 删掉那份 state，改成每次现算 |
| `console.log` 打印**两次** | `StrictMode` 故意让组件跑两遍暴露副作用 bug | 正常现象，不用管 |
| 类型报错 `X is declared but its value is never read` | `noUnusedLocals` 在保护你 | 删掉没用的变量，或先用上它 |

---

## 17. 完整代码

### `src/App.tsx`

```tsx
import { useState } from 'react'
import './App.css'

// 数据的样子
type Task = {
  id: number
  title: string
  done: boolean
}

// 筛选的三种取值。Filter 只能是这三个字符串之一，写错会立刻报错。
type Filter = 'all' | 'active' | 'done'

// 筛选项的配置。用数组存起来，界面上就能 map 出三个按钮。
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '未完成' },
  { value: 'done', label: '已完成' },
]

// 初始数据
const initialTasks: Task[] = [
  { id: 1, title: '装好开发环境，跑起 npm run dev', done: true },
  { id: 2, title: '理解 JSX 是什么', done: false },
  { id: 3, title: '理解 useState 为什么能让界面刷新', done: false },
]

// 生成新任务的 id
let idCounter = initialTasks.length

function createId() {
  idCounter = idCounter + 1
  return idCounter
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }

  function addTask() {
    const title = draft.trim()
    if (title === '') return

    setTasks((prev) => [...prev, { id: createId(), title, done: false }])
    setDraft('')
  }

  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const doneCount = tasks.filter((task) => task.done).length

  // 派生数据：当前该显示哪些任务。
  // 注意它是"算出来"的，不是 state —— 所以永远不可能和 tasks 对不上。
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.done
    if (filter === 'done') return task.done
    return true
  })

  // 每个筛选项对应的任务数量。这里复用了 doneCount，
  // 所以"未完成数"用减法算，不用再 filter 一遍。
  function countOf(value: Filter) {
    if (value === 'all') return tasks.length
    if (value === 'done') return doneCount
    return tasks.length - doneCount
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">我的任务</h1>
        <span className="app-counter">
          {doneCount} / {tasks.length} 已完成
        </span>
      </header>

      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault()
          addTask()
        }}
      >
        <input
          className="task-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="添加一个新任务，回车确认"
        />
        <button className="task-add-button" type="submit">
          添加
        </button>
      </form>

      {/* 筛选栏：用 FILTERS 数组 map 出三个按钮 */}
      <div className="filter-bar">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            className={
              filter === item.value
                ? 'filter-button filter-button--active'
                : 'filter-button'
            }
            type="button"
            onClick={() => setFilter(item.value)}
          >
            {item.label} {countOf(item.value)}
          </button>
        ))}
      </div>

      {visibleTasks.length === 0 ? (
        <p className="task-empty">没有符合条件的任务</p>
      ) : (
        <ul className="task-list">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

type TaskItemProps = {
  task: Task
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className="task-item">
      <button
        className="task-toggle"
        type="button"
        onClick={() => onToggle(task.id)}
      >
        <span
          className={
            task.done ? 'task-checkbox task-checkbox--done' : 'task-checkbox'
          }
        >
          {task.done ? '✓' : ''}
        </span>
        <span className={task.done ? 'task-title--done' : ''}>
          {task.title}
        </span>
      </button>

      <button
        className="task-delete"
        type="button"
        onClick={() => onDelete(task.id)}
      >
        删除
      </button>
    </li>
  )
}
```

### 关于 CSS 的几个要点

样式在 `src/App.css`，类名都是语义化的。有 4 个点值得留意：

**1. `w-full` 类的居中写法**

```css
.app {
  max-width: 480px;
  margin: 0 auto;   /* 左右自动外边距 = 水平居中 */
}
```

**2. `flex: 1` 把删除按钮挤到右边**

```css
.task-item  { display: flex; }
.task-toggle { flex: 1; }   /* 吃掉所有剩余宽度 */
```

`flex: 1` 是 flex 布局最实用的一个属性——**不用算宽度就能实现"左自适应 + 右固定"**。

**3. `button` 不会继承字体**

```css
.task-toggle {
  font-family: inherit;
  font-size: 15px;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}
```

`button` 和 `input` 默认**不继承**父元素的字体和颜色，必须显式写 `inherit`。这是新手最常遇到的"为什么我的按钮字体不一样"。

**4. 用 `--` 表示状态变体**

```css
.task-checkbox { ... }              /* 基础样式 */
.task-checkbox--done { ... }        /* 变体：已完成 */
.filter-button--active { ... }      /* 变体：选中 */
```

`BEM` 命名法的简化版：**一个连字符是"子元素"，两个连字符是"变体"**。好处是看类名就知道是什么关系。

---

## 18. 练习题（含答案）

### 练习 1：环境热身

把 `src/App.css` 里 `.app-title` 的 `font-size` 改成别的值，保存后看页面是否自动更新。

**目的**：确认"改代码 → 界面变了"这条链路是通的，先消掉对工具的生疏感。

### 练习 2：理解"数据驱动界面"

改 `initialTasks` 里的 `done` 值，观察：

- 界面上那条任务是否变成划线灰色
- 右上角计数是否跟着变

**答案**：都会变。因为你改的是**数据**，而界面是数据的投影。你一个字都没碰渲染逻辑——这就是 React 的核心。

**追问：`initialTasks` 和 `tasks` 是什么关系？**

`initialTasks` 是"初始值"，**只在 `useState` 第一次执行时用一次**。之后所有变化都在 `tasks` 里，`initialTasks` 再也不会被读。

### 练习 3：从空白重写 `toggleTask`

不看代码，自己写出"把某一项任务的 `done` 取反"。

**答案**：

```tsx
function toggleTask(id: number) {
  setTasks((prev) =>
    prev.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task,
    ),
  )
}
```

**要点**：用 `map` 造新数组；命中目标时用 `{ ...task, done: ... }` 造新对象；没命中的用 `else` 分支返回原对象。

### 练习 4：添加任务（受控表单）

**答案**：

```tsx
const [draft, setDraft] = useState('')

function addTask() {
  const title = draft.trim()
  if (title === '') return
  setTasks((prev) => [...prev, { id: createId(), title, done: false }])
  setDraft('')
}

// JSX
<form onSubmit={(event) => { event.preventDefault(); addTask() }}>
  <input value={draft} onChange={(event) => setDraft(event.target.value)} />
  <button type="submit">添加</button>
</form>
```

**三个容易漏的点**：

1. `event.preventDefault()` —— 不然提交后刷新页面，state 全清空
2. `draft.trim()` 判空 —— 不然能添加出看不见的空任务
3. `setDraft('')` —— 因为受控组件显示的是 state，清 state 就是清输入框

### 练习 5：删除任务

**答案**：

```tsx
function deleteTask(id: number) {
  setTasks((prev) => prev.filter((task) => task.id !== id))
}
```

**要点**：`filter` 的回调返回 `true` 表示留下，所以写"id **不等于**这条的都留下"。

**顺便注意**：删除功能里**一行都没有为计数写代码**，但计数自动就是对的。这就是派生数据的价值。

### 练习 6：筛选功能

**答案**：

```tsx
const visibleTasks = tasks.filter((task) => {
  if (filter === 'active') return !task.done
  if (filter === 'done') return task.done
  return true
})
```

**验收测试**：点「未完成」→ 给第一条打勾 → **它应该立刻从列表消失**。

如果它不消失，说明你把 `visibleTasks` 存成 state 了，回去看第 12 节。

### 练习 7：故意制造 bug（推荐做一次）

在浏览器控制台里体会 React 的引用比较：

```tsx
// 在 toggleTask 里故意改成"原地修改"
setTasks((prev) => {
  const target = prev.find((task) => task.id === id)
  if (target) target.done = !target.done
  return prev          // ← 返回同一个数组
})
```

**现象**：界面完全不动。但 `console.log(tasks)` 打出来数据是对的。

**原因**：React 靠比较新旧引用来判断是否变化。你返回的是同一个数组引用，React 认为"没变化"，直接跳过渲染。

亲手见一次这个 bug，比看十遍解释都管用。

---

## 19. 自测题

不要看笔记，试着完整回答。答不上来的回去看对应章节。

1. 为什么组件名必须大写开头？小写了会发生什么？（第 4 节）
2. JSX 和 HTML 有哪 4 处不同？（第 5 节）
3. `useState` 返回的第二个东西是什么？为什么不直接改第一个？（第 9 节）
4. 为什么改数组要用 `map` / `filter` 造新数组，而不是 `push`？（第 11 节）
5. `key` 用数组下标会有什么问题？（第 7 节）
6. 父组件的状态怎么传给子组件？子组件想修改它该怎么办？（第 8 节）
7. 调用 `setState` 后，是所有视图都重新渲染，还是只有相关的？（第 9 节）
8. 什么是派生数据？为什么不能存成 state？举一个具体 bug 场景。（第 12 节）
9. `value` + `onChange` 这种写法叫什么？好处是什么？（第 13 节）
10. 为什么 `console.log` 在开发模式下会打印两次？（第 16 节）

**能顺畅答完这 10 题，第 1 周就达标了。**

---

## 20. 下一步：第 2 周

现在这个应用已经能"读"和"写"了，但还有 3 个缺口：

| 待做 | 会学到的知识点 |
|---|---|
| **番茄钟倒计时**（25 分钟倒数，可暂停/重置） | `useEffect`、`setInterval` 与清理函数、内存泄漏 |
| **数据持久化**（刷新后任务不丢） | `localStorage`、序列化、初始化时读本地数据 |
| **部署上线** | 生产构建、Vercel 部署、环境变量 |

其中 **`useEffect` 的清理函数**是第 2 周最容易出错的地方——忘记清理会导致定时器累积、内存泄漏、数字跳得越来越快。到时会专门讲。

---

## 附：本周 git 提交记录

```
docs: 全栈学习路线设计文档（React + Tailwind + Next.js + FastAPI，8周排期）
feat(01-pomodoro): 搭建 Vite+React+TS+Tailwind 骨架并写出第一个任务列表组件
docs(01-pomodoro): 为 className 补充 Tailwind 到 CSS 的对照注释，并添加常用类速查表
feat(01-pomodoro): 添加任务功能（受控表单 + useRef 焦点管理 + 不可变新增）
refactor(01-pomodoro): 移除 Tailwind 改用普通 CSS，精简注释、去掉 useRef
feat(01-pomodoro): 拆分任务项结构以支持删除按钮
feat(01-pomodoro): 实现删除任务（filter 不可变删除）
feat(01-pomodoro): 添加筛选栏与空状态
feat(01-pomodoro): 完成筛选逻辑与切换交互（第 1 周功能收尾）
```

> **每周结束时回看一遍提交记录**，能直观看到自己这周做了什么。这也是 git 的用法之一：**用提交历史记录学习轨迹**。
