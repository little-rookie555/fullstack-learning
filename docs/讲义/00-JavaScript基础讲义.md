# JavaScript / TypeScript 基础讲义（第 0 周）

> **定位**：这不是"从零学 JS"的教程，而是一份**补齐讲义**。
>
> 到第 2 周为止，代码里已经大量使用了这些语法，但一直没有系统讲过：
> 展开运算符、解构、数组方法、泛型、`async/await`……
> 结果是"能照着抄，但说不出为什么"。
>
> 这份讲义的作用就是把这些**补成真正理解的东西**。
>
> **日期**：2026-10-15

---

## 0. 怎么用这份讲义

| 章节 | 优先级 | 说明 |
|---|---|---|
| 2-6（变量/对象/解构/展开/函数） | ⭐⭐⭐ | **必读**。React 里到处都在用 |
| 7（数组方法） | ⭐⭐⭐ | **必读**。不可变更新的基础 |
| 8（运算符） | ⭐⭐ | 常用，遇到再查也行 |
| 9（TypeScript 类型、泛型） | ⭐⭐⭐ | **必读**。看不懂 `<Task[]>` 会一直困惑 |
| 11（异步 / Promise / async-await） | ⭐⭐⭐ | **项目 2 的硬前置**，不读会撞墙 |
| 12（闭包） | ⭐⭐ | 理解 React "捕获旧值"的关键 |
| 10（模块）、13（陷阱） | ⭐ | 快速过一遍 |

**读法建议**：不要一口气读完，按上面优先级分两次。

---

## 1. 先看清楚：为什么需要补这一课

看一段你已经写过的代码：

```tsx
const [tasks, setTasks] = useState<Task[]>(initialTasks)

function toggleTask(id: number) {
  setTasks((prev) =>
    prev.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task,
    ),
  )
}
```

这 8 行里藏了 **7 个 JS/TS 语法点**：

| 语法 | 在哪 |
|---|---|
| 数组解构 | `const [tasks, setTasks] = ...` |
| 泛型 | `useState<Task[]>` |
| 类型标注 | `id: number` |
| 箭头函数 | `(prev) => ...` |
| 数组方法 | `.map(...)` |
| 展开运算符 | `{ ...task, done: ... }` |
| 三元表达式 | `task.id === id ? A : B` |
| 函数式更新 | `(prev) => ...` 而不是直接传值 |

**你能写出这段代码，说明你已经"会用"了。但如果没有一行是"我确定它是什么意思"，那就该补这一课。**

---

## 2. 变量、值与类型

### 2.1 `const` 和 `let`，以及为什么不用 `var`

```js
const PI = 3.14       // 不能重新赋值
let count = 0         // 可以重新赋值
count = 1             // ✅ 可以

const name = 'Tom'
name = 'Jerry'        // ❌ TypeError: Assignment to constant variable
```

**规则**：默认用 `const`，只有确实需要重新赋值时才用 `let`。

为什么？因为 `const` 让读代码的人**少想一件事**——不用怀疑"这个变量后面会不会被改掉"。

> `var` 是旧语法，有"变量提升"和"不检查重复声明"等奇怪的坑，**新代码里不要用**。

### 2.2 一个反直觉的点：`const` 不等于"内容不可变"

```js
const task = { id: 1, title: '写代码' }

task.title = '看书'       // ✅ 可以！改了对象内容的字段
task = { id: 1 }          // ❌ 不行！不能把 task 指向另一个对象
```

**`const` 锁的只是"这个变量名指向哪个对象"，不是"对象里面不能改"。**

这一点很重要，因为它正是 React 里那些 bug 的根源：

```js
task.done = true          // 语法上完全合法，能跑
setTasks(prev => { ... }) // 但 React 不知道你改了，界面不更新
```

**TS/JS 不会拦你，只有"React 靠引用比较判断变化"这条规则会惩罚你。**

### 2.3 原始类型 vs 对象（理解"引用"）

```js
// 原始类型：number / string / boolean / null / undefined / symbol / bigint
let a = 1
let b = a
b = 2
console.log(a)     // 1  ← a 不受影响，复制的是"值"

// 对象和数组：复制的是"引用（地址）"
let x = { n: 1 }
let y = x
y.n = 2
console.log(x.n)   // 2  ← x 也变了！x 和 y 指向同一个对象
```

用一张图理解：

```
原始类型                      对象 / 数组
  a ─→ [1]                    x ─┐
  b ─→ [1]   （各有一份）          ├─→ { n: 1 }   （只有一个对象）
                               y ─┘
```

**这就是"不可变更新"存在的原因**：

```js
// ❌ 原地改：x 和 y 都受影响，React 也看不出变化
task.done = true

// ✅ 造新对象：新对象在另一个位置，React 一比较就知道变了
const newTask = { ...task, done: true }
```

### 2.4 TypeScript 的类型标注

```ts
let name: string = 'Tom'
let age: number = 25
let isDone: boolean = false
let tags: string[] = ['前端', '后端']
```

冒号后面就是**类型标注**。它的作用是**在写代码时（不是运行时）就发现问题**：

```ts
let age: number = 'Tom'    // ❌ 立刻报错：Type 'string' is not assignable to type 'number'
```

> **重要认知**：TypeScript 的类型只在**编译时**存在。经过 `vite build` 之后，类型会被全部擦掉，运行时就是普通 JS。
>
> 所以类型**不会**帮你挡住"从后端拿回来的数据格式不对"——那只会在运行时炸。TS 管的是"你自己写的代码内部是否自洽"。

### 2.5 类型推断：为什么很多时候不用写类型

```ts
let count = 0                  // TS 自动推断为 number
let title = '任务'             // 自动推断为 string
const tasks = []               // ⚠️ 推断为 never[]（空数组推不出来），要手动标
const tasks: Task[] = []       // ✅ 正确
```

**推断规则：TS 会尽可能自己猜。只有当它猜不出来（比如空数组、函数参数）时，才需要你写。**

这就是为什么 `const [draft, setDraft] = useState('')` 不用写 `<string>`——因为 `''` 已经说明它是字符串了。而 `useState<Task[]>([])` 必须写，因为 `[]` 推不出元素类型。

---

## 3. 对象与数组的读写

### 3.1 读

```js
const task = { id: 1, title: '写代码', done: false }
const tags = ['前端', '后端']

task.title           // '写代码'      点号，属性名是固定的
task['title']        // '写代码'      方括号，属性名可以是变量
tags[0]              // '前端'        数组下标从 0 开始
tags.length          // 2
task.author          // undefined    ⚠️ 不存在的属性不会报错，返回 undefined
```

> **`undefined` 是 JS 里最常见的 bug 来源。** 访问不存在的属性、数组越界，都得到 `undefined`，而不是报错。所以 TS 才那么有价值——它能在编译时告诉你"这个属性可能不存在"。

### 3.2 改：区分「原地修改」和「造新的」

这是**整个 React 里最重要的区分**。

```js
const tags = ['前端', '后端']

// ── 原地修改（mutating）─────────────────
tags.push('工具')           // ✅ 能跑，但 tags 引用没变
tags.splice(0, 1)          // 删除下标 0
tags[0] = '改掉了'
tags.sort()

// ── 造新数组（immutable）────────────────
const added    = [...tags, '工具']                    // 增
const removed  = tags.filter(t => t !== '前端')        // 删
const changed  = tags.map(t => t === '前端' ? 'FE' : t) // 改
const sorted   = [...tags].sort()                     // 排序（先复制再排）
```

| 操作 | 原地修改 | 造新的 |
|---|---|---|
| 增 | `arr.push(x)` | `[...arr, x]` |
| 删 | `arr.splice(i, 1)` | `arr.filter(...)` |
| 改 | `arr[i] = x` | `arr.map(...)` |
| 排序 | `arr.sort()` | `[...arr].sort()` |

**在 React 里，永远用右边这一列。**

> ⚠️ 特别提醒 `sort()` 和 `reverse()`：**它们也是原地修改的**，所以必须写成 `[...arr].sort()`。这是最容易忽略的一个。

---

## 4. 解构赋值

### 4.1 数组解构

```js
const pair = ['Tom', 25]

// 传统写法
const name = pair[0]
const age = pair[1]

// 解构写法
const [name, age] = pair
```

**每一次写 `const [x, y] = ...`，都是在"按位置取出数组里的元素并起个新名字"。**

你早就见过它了：

```tsx
const [tasks, setTasks] = useState([])
//    ↑        ↑
// 当前位置0   位置1
```

`useState` 返回的是一个**长度为 2 的数组**，解构只是把它的两个元素取出来命名。

**跳过的位置**：

```js
const [, second] = ['a', 'b']    // 只取第二个，第一个位置留空
```

### 4.2 对象解构

```js
const task = { id: 1, title: '写代码', done: false }

// 传统写法
const title = task.title

// 解构写法（按【属性名】取，不是按位置）
const { title } = task

// 一次取多个
const { id, title, done } = task

// 重命名（把 title 取出并改叫 name）
const { title: name } = task

// 给默认值（属性不存在时用默认值）
const { author = '匿名' } = task
```

**注意区别**：数组解构**按位置**，对象解构**按属性名**。所以对象解构时名字必须对得上（或重命名）。

你在 React 里见过它：

```tsx
function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
//                ↑ 直接从 props 对象里按名字取出这三项
```

### 4.3 函数参数里解构

```js
// 不用解构
function TaskItem(props) {
  return <span>{props.task.title}</span>
}

// 用解构（更常见）
function TaskItem({ task, onToggle }) {
  return <span>{task.title}</span>
}
```

**这两种完全等价**，第二种只是少打几次 `props.`。

### 4.4 嵌套解构

```js
const data = { user: { name: 'Tom', tags: ['a', 'b'] } }

const { user: { name, tags: [first] } } = data
// name = 'Tom'，first = 'a'
```

**能用，但嵌套超过两层就很难读。** 不如分两步写清楚。

---

## 5. 展开运算符 `...`

**这是 React 里出现频率最高的语法之一。** 它有两个完全不同的用途。

### 5.1 展开：把「里面的东西倒出来」

**数组**：

```js
const a = [1, 2, 3]
const b = [...a, 4]           // [1, 2, 3, 4]
const c = [0, ...a, 4]        // [0, 1, 2, 3, 4]
const 拷贝 = [...a]            // [1, 2, 3]（新数组，不是同一个）
```

**对象**：

```js
const task = { id: 1, title: '写代码', done: false }

const updated = { ...task, done: true }
// { id: 1, title: '写代码', done: true }
//   ↑ 先把 task 所有字段倒进来，然后 done 覆盖掉原来的
```

**关键机制：后面的同名字段会覆盖前面的。**

```js
{ ...task, title: '新标题' }
// 等价于：先铺开 task，再用新 title 覆盖
```

这就是"改一个字段"的标准写法——**不需要手动列出其它字段**。

> 如果不用展开运算符，你得这么写：
> ```js
> const updated = {
>   id: task.id,
>   title: task.title,
>   done: true,        // 只有这个改了，但你得把其它字段全抄一遍
>   author: task.author,
>   ...
> }
> ```
> 一旦 `task` 加了新字段，你就得回来补。**展开运算符让"只改一个字段"变得不需要维护。**

### 5.2 剩余参数：把「剩下的」收起来

```js
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0)
}
sum(1, 2, 3)      // 6，numbers = [1, 2, 3]

const { id, ...rest } = { id: 1, title: 'x', done: false }
// id = 1，rest = { title: 'x', done: false }
```

**同一个 `...`，位置不同含义就相反：**
- 出现在**赋值右边 / 函数调用里** → **展开**（倒出来）
- 出现在**赋值左边 / 函数参数里** → **收起来**

### 5.3 一个重要提醒：`...` 只做「浅拷贝」

```js
const task = { id: 1, meta: { author: 'Tom' } }
const copy = { ...task }

copy.meta.author = 'Jerry'
console.log(task.meta.author)    // 'Jerry' ← 原对象也被改了！
```

**为什么？** 因为 `...` 只复制"第一层的字段值"。`meta` 的值是一个**对象引用**，复制过去的还是同一个引用。

```
task ──→ { id: 1, meta: ──┐
                          ├──→ { author: 'Tom' }
copy ──→ { id: 1, meta: ──┘
```

**要改深层字段，每一层都要展开**：

```js
const copy = { ...task, meta: { ...task.meta, author: 'Jerry' } }
```

> 在 React 里，**你的 state 应该是"扁平的"**。深层嵌套的对象改起来又长又容易错——这也是为什么 `Task` 只有 `id / title / done` 三个平铺字段。

---

## 6. 函数

### 6.1 两种写法

```js
// 函数声明（会被"提升"，可以先调用后定义）
function greet(name) {
  return '你好，' + name
}

// 函数表达式（赋值给变量）
const greet = function (name) {
  return '你好，' + name
}

// 箭头函数（最常用）
const greet = (name) => {
  return '你好，' + name
}

// 箭头函数简写：只有一句 return 时，可以省掉 {} 和 return
const greet = (name) => '你好，' + name
```

**四种写法功能基本一样，视图上箭头函数最简洁，所以现代代码里最常见。**

### 6.2 箭头函数的简写规则（容易看晕，但必须认识）

```js
// 1. 参数只有一个时可以省括号
const double = n => n * 2

// 2. 函数体只有一句时可以省 {} 和 return（叫"隐式返回"）
const double = (n) => n * 2

// 3. 想返回一个对象字面量，必须用 () 包起来
const makeTask = (title) => ({ title, done: false })
// ❌ 不能写 (title) => { title, done: false }  ← {} 会被当成函数体，不是对象

// 4. 没有参数时必须写空括号
const now = () => Date.now()
```

**你在 React 里见过的大量写法**：

```tsx
onClick={() => onToggle(task.id)}        // 无参数，箭头后是表达式
setTasks((prev) => prev.filter(...))     // 一个参数，省了括号
tasks.map((task) => (                    // 返回 JSX，用 () 包住
  <li>{task.title}</li>
))
```

### 6.3 参数默认值

```js
function createTask(title, done = false) {
  return { title, done }
}
createTask('写代码')          // { title: '写代码', done: false }
```

**注意顺序**：`tasks.map((task, index) => ...)` 里，第二个参数就是下标。React 的很多回调都有这个（但**别用下标当 `key`**，第一周讲过）。

### 6.4 「回调函数」是什么

```js
function doTwice(fn) {
  fn()
  fn()
}

doTwice(() => console.log('hi'))    // 打印两次
```

**"回调" = 把函数当成参数传给另一个函数，让它在合适的时机执行。**

在 React 里到处都是：

```tsx
setTimeout(() => { ... }, 1000)      // 1 秒后执行的函数
onClick={() => onToggle(task.id)}    // 点击时执行的函数
tasks.filter((task) => task.done)    // 每个元素执行的函数
```

**关键点：传的是"函数本身"，不是"函数的执行结果"。**

```tsx
onClick={handleClick}         // ✅ 传函数
onClick={handleClick()}       // ❌ 这行会立刻执行，把返回值传过去
onClick={() => handleClick(id)}  // ✅ 需要传参数时，用箭头函数包一层
```

### 6.5 `this`（简单带过）

普通函数的 `this` 取决于**谁调用它**，容易出错。**箭头函数没有自己的 `this`**，它会用外层的。

**好消息**：React 的函数组件和 Hooks 里基本不用 `this`。所以这条了解即可——**但你要知道箭头函数"没有自己的 this"这个特性**，别人问你时能答上来。

---

## 7. 数组方法四件套（核心章节）

你在第一周学的"不可变更新三件套"（`map` / `filter` / `[...prev]`）就建立在这一章上。

### 7.1 `map` —— 一对一变形，长度不变

```js
const nums = [1, 2, 3]
const doubled = nums.map((n) => n * 2)     // [2, 4, 6]

const tasks = [{ title: 'a' }, { title: 'b' }]
const titles = tasks.map((t) => t.title)   // ['a', 'b']
```

**规则**：
- 对每个元素执行回调，**收集返回值组成新数组**
- **回调必须 return 一个东西**，否则新数组里全是 `undefined`
- **长度永远和原数组一样**

**在 React 里最典型的用途**：把数据数组变成组件数组。

```tsx
{tasks.map((task) => (
  <TaskItem key={task.id} task={task} />
))}
```

### 7.2 `filter` —— 筛选，长度可变

```js
const nums = [1, 2, 3, 4]
const even = nums.filter((n) => n % 2 === 0)   // [2, 4]

const tasks = [{ done: true }, { done: false }]
const done = tasks.filter((t) => t.done)        // 只留下 done 为 true 的
```

**规则**：
- 回调必须 return **`true` 或 `false`**
- `true` → 这个元素**进新数组**；`false` → **丢掉**
- 长度可能变短（也可能一个都不剩）

**记住这个语义**："返回 `true` 表示留下"。所以"删除某条"要写成"**id 不等于这条的**都留下"：

```tsx
prev.filter((task) => task.id !== id)
```

### 7.3 `map` 和 `filter` 的对比（一张表说清）

| | `map` | `filter` |
|---|---|---|
| 回调返回什么 | **一个元素**（"把它变成什么"） | **布尔值**（"要不要留下"） |
| 新数组长度 | 和原来**一样** | **可能变短** |
| React 里用途 | 改某一项、渲染列表 | 删除某一项、按条件筛选 |

**你现在应该能解释这句话了**：为什么"改任务"用 `map`，"删任务"用 `filter`？
因为改不会让列表变短，删会。

### 7.4 `find` / `findIndex` —— 找第一个匹配的

```js
const tasks = [
  { id: 1, title: 'a' },
  { id: 2, title: 'b' },
]

const found = tasks.find((t) => t.id === 2)        // { id: 2, title: 'b' }
const index = tasks.findIndex((t) => t.id === 2)   // 1
const missing = tasks.find((t) => t.id === 99)     // undefined
```

**注意 `find` 返回的是"那个元素"（或者 `undefined`），不是数组。**

### 7.5 链式调用：方法可以连起来

```js
const result = tasks
  .filter((t) => t.done)        // 先筛出已完成的
  .map((t) => t.title)          // 再取标题
  .join('、')                    // 再拼成字符串
```

**每一步的返回值都是数组，所以可以继续调下一个方法。**

```tsx
const doneCount = tasks.filter((task) => task.done).length
//                       ↑ filter 返回数组        ↑ 取长度
```

### 7.6 `reduce`（进阶，先知道有这回事）

```js
const nums = [1, 2, 3, 4]
const total = nums.reduce((acc, n) => acc + n, 0)   // 10
//                            ↑累加值  ↑当前项   ↑初始值
```

**`reduce` 把整个数组"压缩"成一个值。** 求和、求最大值、按条件分组都用它。

**但可读性差，能用 `filter`/`map` 组合出来的就别用 `reduce`。** React 里最常见的一个用途是"从数组里算出下一个 id"：

```tsx
const nextId = Math.max(0, ...prev.map((t) => t.id)) + 1
```

### 7.7 什么时候用哪个（决策表）

| 我想… | 用 |
|---|---|
| 把每一项变成别的东西（渲染列表、取字段） | `map` |
| 按条件保留一部分 | `filter` |
| 找第一个符合的**元素** | `find` |
| 找第一个符合的**位置** | `findIndex` |
| 判断**有没有**符合的 | `some` |
| 判断**是不是全部**符合 | `every` |
| 把整个数组算成一个值 | `reduce` |

### 7.8 一个重要前提：这些方法都不改原数组

```js
const nums = [1, 2, 3]
nums.map((n) => n * 2)
console.log(nums)      // [1, 2, 3] ← 原数组没变
```

**`map` / `filter` / `find` / `some` / `every` / `reduce` 全部返回新值，不动原数组。**

（对比一下 `push` / `splice` / `sort` / `reverse` —— 这四个是**原地修改**的。）

**这就是为什么"不可变更新"用它们写起来这么自然。**

---

## 8. 常用运算符

### 8.1 模板字符串

```js
const name = 'Tom'
const msg = `你好，${name}！今年 ${2026 - 1990} 岁。`
//                  ↑ 反引号            ↑ ${} 里可以放任何表达式
```

**三个好处**：不用拼 `+`、可以换行、`${}` 里能放表达式。

你在项目 1 里写过：

```ts
return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
```

### 8.2 三元表达式

```js
const label = isRunning ? '暂停' : '开始'
//             条件       为true时  为false时
```

**JSX 里条件渲染几乎全靠它**（因为 `{}` 里不能写 `if`）：

```tsx
{isRunning ? '暂停' : '开始'}
```

**嵌套三元很危险**，超过两层就该抽成函数。

### 8.3 `&&` 和 `||`

```js
// && ：前面为真才返回后面
const len = tasks && tasks.length

// || ：前面为假就用后面的（常用于给默认值）
const title = input || '未命名'

// ?? ：前面是 null 或 undefined 才用后面的
const count = value ?? 0
```

**`||` 和 `??` 的区别很重要**：

```js
0 || '默认'      // '默认'   ← 0 被当成"假值"，被替换了
0 ?? '默认'      // 0        ← 只有 null/undefined 才替换，0 是有效值

'' || '默认'     // '默认'
'' ?? '默认'     // ''
```

**JS 里的"假值"只有 7 个**：`false`、`0`、`-0`、`0n`、`''`、`null`、`undefined`、`NaN`。**其它一切都是真值**（包括空数组 `[]` 和空对象 `{}`，这经常让新手意外）。

**在 JSX 里用 `&&` 做条件渲染**：

```tsx
{isLoading && <p>加载中…</p>}
// 前面为真时渲染后面的，为假时渲染 false（React 不渲染 false）
```

> ⚠️ 一个经典坑：`{count && <p>...</p>}` 当 `count` 是 `0` 时，会**把 `0` 渲染到页面上**。
> 因为 `0 && x` 的结果是 `0`，而 React 会渲染数字 `0`。
> 解决：写成 `{count > 0 && ...}` 或 `{count ? ... : null}`。

### 8.4 可选链 `?.`

```js
const user = { profile: { name: 'Tom' } }

user.profile.name          // 'Tom'
user.address.city          // ❌ TypeError: Cannot read properties of undefined

user.address?.city         // undefined  ← 不会报错，安全
```

**含义："如果 `?.` 左边是 `null` 或 `undefined`，就整个返回 `undefined`，不再往下取。"**

你也见过函数调用版本：

```ts
inputRef.current?.focus()      // current 为 null 时不调用，也不报错
```

### 8.5 `===` 和 `==`（只用前者）

```js
1 == '1'      // true   ← 会做隐式类型转换，反直觉
1 === '1'     // false  ← 严格相等，符合直觉

null == undefined      // true
null === undefined     // false
```

**规则：永远用 `===` 和 `!==`，不用 `==` 和 `!=`。**

理由：接了后端接口之后，`id` 有时是字符串有时是数字，`==` 会给你埋下极难排查的 bug。

---

## 9. TypeScript 类型系统

### 9.1 为什么需要 TS

```js
// JS：字段名写错，要到运行时才发现
function showTask(task) {
  return task.titl          // 打错了，但不会报错，只返回 undefined
}
```

```ts
// TS：写错立刻报错
type Task = { id: number; title: string; done: boolean }

function showTask(task: Task) {
  return task.titl          // ❌ Property 'titl' does not exist on type 'Task'
}
```

**TS 的价值不是"类型"，而是"编辑器能提前告诉你哪里错了"。** 它把 bug 从"运行时报错"提前到了"写代码时报错"。

### 9.2 `type` 声明一个类型

```ts
type Task = {
  id: number
  title: string
  done: boolean
}

type Filter = 'all' | 'active' | 'done'
```

**两种成员标记方式**：

```ts
type A = { id: number }        // TS 默认用分号
type B = { id: number; }       // 也可以，混用不难看
```

### 9.3 联合类型：`|` 表示"或者"

```ts
let id: number | string        // 数字或字符串都行
let tag: '前端' | '后端'        // 只能是这两个字符串之一（字面量联合）
```

**字面量联合的限制力极强**——你写 `tag = '前端开发'` 会直接报错。项目 1 的 `Filter` 就是这么定的，好处是"筛选项写错立刻发现"，而不是"运行时筛选永远不生效"。

### 9.4 可选属性：`?`

```ts
type Task = {
  id: number
  title: string
  note?: string        // 可以有，也可以没有
}
```

**用了 `?` 之后，取值时必须处理"可能不存在"**：

```ts
task.note.length          // ❌ TS 报错：note 可能是 undefined
task.note?.length         // ✅
task.note ?? '无备注'      // ✅
```

### 9.5 泛型：`<>` 到底是什么（**重点**）

你一定被这个写法困惑过：

```tsx
useState<Task[]>(initialTasks)
//        ↑ 这就是泛型
```

**泛型的含义：这个"类型"是一个"待填的空位"，由使用时决定。**

先看一个不用 `useState` 的例子。假设我们自己写一个"取数组第一个元素"的函数：

```ts
function first(arr: number[]): number {
  return arr[0]
}
```

这只能处理数字数组。想支持字符串，得再写一个。**泛型解决的就是这个"类型也要当参数传"的问题**：

```ts
function first<T>(arr: T[]): T {
  return arr[0]
}
//          ↑ T 是个"类型变量"，调用时才确定

const a = first([1, 2, 3])         // T 推断为 number → a 是 number
const b = first(['x', 'y'])        // T 推断为 string → b 是 string
```

**`<T>` 读作"对于某个类型 T"**。它让一份代码适配多种类型，同时保留类型检查。

回到 `useState`。它的类型签名（简化版）是这样的：

```ts
function useState<T>(初始值: T): [T, (新值: T) => void]
//              ↑ 空位             ↑ 返回数组第1个是 T，第2个是"接收 T 的函数"
```

所以：

```tsx
useState<Task[]>(initialTasks)
//        ↑ 把空位 T 填成 Task[]
// 返回 [Task[], (新值: Task[]) => void]
//       ↑ 所以 tasks 是 Task[]，setTasks 只接受 Task[]
```

**这就是"泛型"在 `useState` 里的实际作用**：它把"这个 state 里装什么类型"这个信息，**传递给了返回值**，于是 `tasks.map(...)` 里的 `task` 就能自动推断出类型，写错字段名立刻报错。

> **你其实早就在用泛型了，只是没意识到。** 记住这个心智模型：
> **`<XXX>` 里的东西是"填空"，不是"某种特殊的语法"。**

**什么时候必须手写泛型**：当 TS 推不出来的时候。典型就是空数组：

```tsx
const [tasks, setTasks] = useState([])          // ❌ 推断为 never[]
const [tasks, setTasks] = useState<Task[]>([])  // ✅ 明确告诉它装什么
```

### 9.6 类型断言 `as`：对 TS 说"我知道，相信我"

```ts
const parsed = JSON.parse(saved)     // parsed 的类型是 any（TS 不知道里面是什么）
return parsed as Task[]              // 断言：我说它是 Task[]
```

**`as` 的意思是"别管你推断出什么，就按我说的这个类型处理"。**

⚠️ **它不会做任何运行时检查。** 你断言成 `Task[]`，但实际数据可能是个字符串——TS 不会拦，运行时会炸。

**所以 `as` 往往要配合运行时检查一起用**（项目 1 里的写法）：

```ts
const parsed = JSON.parse(saved)
if (Array.isArray(parsed)) return parsed as Task[]   // 先检查，再断言
return initialTasks
```

**原则：能不用 `as` 就不用。** 它是在"绕过 TS 的保护"，用多了等于白用 TS。

### 9.7 `any` 是个陷阱

```ts
let data: any = ...
data.随便什么属性.都能点.不报错
```

`any` = "关掉这个变量的类型检查"。**看起来方便，实际是灾难**——错误会被推迟到运行时，也就是 TS 白装了。

`JSON.parse()` 返回的就是 `any`（因为解析结果无法在编译时知道），所以从它取值时要格外小心。

---

## 10. 模块：`import` / `export`

**一个文件 = 一个模块。想让别的文件用你的东西，必须 `export`。**

### 10.1 具名导出

```ts
// utils.ts
export function formatTime(seconds: number) { ... }
export const MAX = 100

// 别的文件
import { formatTime, MAX } from './utils'
```

### 10.2 默认导出

```ts
// App.tsx
export default function App() { ... }

// main.tsx
import App from './App'      // 名字可以随便起（因为它没有名字，就是"默认的"）
```

### 10.3 对比

| | 具名导出 | 默认导出 |
|---|---|---|
| 一个文件能有几个 | 任意多个 | **最多一个** |
| 导入时名字 | **必须完全一致** | 可以自己起 |
| 导入写法 | `import { x }` | `import x` |

**项目里的实际用法**：

```tsx
import { useState, useEffect } from 'react'   // 从包里具名导入 Hook
import App from './App'                       // 导入自己的组件（默认导出）
import './App.css'                            // 只导入不取值（副作用导入：把 CSS 加载进来）
```

### 10.4 路径写法

```ts
import './App.css'            // 相对路径：以 . 开头
import App from '../App'      // 上一级目录
import { useState } from 'react'   // 不以 . 开头 = 从 node_modules 里的包导入
```

**规则：以 `.` 开头的是"文件路径"，否则是"包名"。** 写错这个（比如 `from 'App'` 而不是 `'./App'`）是常见报错来源。

---

## 11. 同步、异步与 Promise（**项目 2 的硬前置**）

**这一章是让你"卡在 fetch 上"的唯一原因，务必读完。**

### 11.1 为什么会有"异步"

JavaScript 是**单线程**的——同一时刻只能做一件事。

那网络请求（可能要几秒）怎么办？如果"等它"，页面就完全卡死了（点按钮没反应）。

**所以 JS 的方案是：不等。先去做别的事，等结果回来了再通知你。**

```js
console.log('1')
setTimeout(() => console.log('3'), 1000)   // 1 秒后再执行
console.log('2')

// 输出顺序：1  2  3     ← 注意不是 1 2 3 的顺序等待
```

**`setTimeout` 不会"卡住"程序**，它只是登记一个"1 秒后要做的事"，然后立刻返回继续往下走。

### 11.2 回调函数方案（旧，但要知道）

```js
setTimeout(() => {
  console.log('1 秒后')
}, 1000)
```

**问题**：如果需要"请求 A 完成后再请求 B，B 完成后再请求 C"，就会变成：

```js
请求A(() => {
  请求B(() => {
    请求C(() => {
      // 层层嵌套，这就是著名的"回调地狱"
    })
  })
})
```

**Promise 就是为了解决这个而生的。**

### 11.3 Promise 是什么

**一句话：Promise 是一个"未来会有结果的东西"，它现在还不是结果。**

类比：**餐厅的取餐号**。

- 你付钱拿到取餐号时，**饭还没做好**（`pending`）
- 但取餐号**承诺**了结果会来
- 你可以**等**（`await`），也可以**挂个回调**（`.then()`）
- 结果只有两种：**做好了**（`fulfilled`）或 **失败了**（`rejected`）

**三种状态**：

| 状态 | 含义 |
|---|---|
| `pending` | 进行中，还没有结果 |
| `fulfilled` | 成功，有值了 |
| `rejected` | 失败，有原因（错误） |

**Promise 一旦有结果就固定了，不会变回去。**

### 11.4 旧写法：`.then()` / `.catch()`

```js
fetch('http://127.0.0.1:8000/api/bookmarks')
  .then((response) => response.json())      // 拿到响应后，再解析 JSON（又是一个 Promise）
  .then((data) => console.log(data))        // 拿到数据
  .catch((error) => console.error(error))   // 任何一步出错都到这里
```

**能读懂就行**，新代码更推荐下面这种写法。

### 11.5 新写法：`async` / `await`（**推荐**）

```js
async function loadBookmarks() {
  const response = await fetch('http://127.0.0.1:8000/api/bookmarks')
  const data = await response.json()
  console.log(data)
}
```

**两条规则**：

1. **`await` 只能写在 `async` 函数里**
2. **`await` 的意思是"在这里等这个 Promise 有结果"**，然后把结果作为表达式的值

**`async` 的作用**：标记这个函数里有 `await`。而且 `async` 函数**一定返回 Promise**。

```js
async function f() { return 1 }
f()                     // 返回 Promise<1>，不是 1
await f()               // 1
```

### 11.6 一个关键认知：`await` 不阻塞整个程序

这点很容易误解：

```js
async function a() {
  console.log('a 开始')
  await sleep(1000)
  console.log('a 结束')
}

a()
console.log('外面')
// 输出：a 开始 → 外面 → a 结束
```

**`await` 只是"暂停这个函数"，不是"冻结整个页面"。** 别的代码照常执行。

（这也是为什么界面不会在请求期间卡住。）

### 11.7 错误处理：`try` / `catch` + `await`

```ts
async function loadBookmarks() {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/bookmarks')
    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('加载失败：', error)
    return []
  }
}
```

**`try` 里的任何一步出错（包括 `await` 的 Promise 被 reject），都会跳到 `catch`。**

### 11.8 ⚠️ 一个必须知道的坑：`fetch` 不会因为 404/500 而报错

**这是新人最常踩的坑之一。**

```js
const response = await fetch('/api/不存在的路径')
console.log(response.status)     // 404
console.log(response.ok)         // false
// 但！代码不会抛错，会继续往下走
```

**`fetch` 只在"网络层失败"时才 reject**（断网、域名解析失败、CORS 被拦）。**HTTP 状态码 4xx / 5xx 都被视为"成功收到响应"**。

所以**必须自己检查 `response.ok`**：

```js
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`)
}
```

**不写这一行的后果**：后端返回 500 错误页（HTML），你的代码继续 `response.json()`，然后报一个莫名其妙的 JSON 解析错误——**你会去查 JSON 的问题，而真正的问题是后端挂了**。

### 11.9 `response.json()` 为什么也要 `await`

因为**读取响应体本身也是异步的**（数据是一块块传过来的）。

```js
const data = await response.json()
//           ↑ 别忘
```

**`response.json()` 返回的是一个 Promise**，忘了 `await` 的话，`data` 会是 Promise 对象而不是数据，后面 `data.map(...)` 就会报 "is not a function"。

### 11.10 完整的可用模板（项目 2 会用到）

```ts
type Bookmark = {
  id: number
  title: string
  url: string
  tag: string
}

async function fetchBookmarks(): Promise<Bookmark[]> {
  const response = await fetch('http://127.0.0.1:8000/api/bookmarks')

  if (!response.ok) {
    throw new Error(`请求失败：HTTP ${response.status}`)
  }

  const data = await response.json()
  return data as Bookmark[]
}
```

**注意函数返回类型写的是 `Promise<Bookmark[]>`** —— 因为 `async` 函数一定返回 Promise。这是 `async` 在类型层面的体现。

### 11.11 常见错误清单

| 错误写法 | 后果 |
|---|---|
| 忘了 `await` | 拿到的是 Promise 对象，不是数据 |
| 只在 `async` 函数外用 `await` | 语法报错 |
| 忘了检查 `response.ok` | 4xx/5xx 被当成成功，错误延后爆发 |
| 只用 `.then()` 没写 `.catch()` | 出错时静默失败，完全查不到原因 |
| `try/catch` 包不住 `await` | 错误逃逸，变成"未处理的 Promise 拒绝" |

---

## 12. 闭包（理解 React "捕获旧值"的关键）

### 12.1 什么是闭包

**一句话：函数会"记住"它被定义时所在作用域里的变量。**

```js
function createCounter() {
  let count = 0

  return () => {
    count = count + 1
    return count
  }
}

const next = createCounter()
next()      // 1
next()      // 2
next()      // 3
```

**`createCounter()` 早就执行完了，`count` 理应被销毁——但 `next` 仍然能访问并修改它。**

这就是闭包：**内层函数"抓着"外层函数的变量不放。**

### 12.2 它在 React 里意味着什么

**每次渲染，组件函数都会重新执行一遍。** 这意味着：

> **每一次渲染，都会创建一整套全新的函数，这些函数各自"记住"了那一次渲染时的 state 值。**

```tsx
function App() {
  const [count, setCount] = useState(0)

  // 这个函数在【每一次渲染】时都会被重新创建
  function handleClick() {
    console.log(count)   // 它记住的是"创建它那次渲染"的 count
  }

  return <button onClick={handleClick}>{count}</button>
}
```

**第一次渲染时创建的 `handleClick`，里面的 `count` 永远是 0。** 但因为你每次渲染都重新创建了 `handleClick` 并绑到按钮上，所以用户点到的总是"最新那个"——**这就是为什么平时感觉不到问题**。

**真正会出问题的地方，是那些"不会被重建"的函数** —— 最典型的就是 `useEffect`：

```tsx
useEffect(() => {
  const timerId = setInterval(() => {
    console.log(count)     // ❌ 永远是第一次渲染时的 0
  }, 1000)
  return () => clearInterval(timerId)
}, [])   // ← 空依赖：这个 effect 只跑一次，所以闭包也是第一次的
```

**现象**：`count` 一直在变，但日志永远打印 0。

**两种解法**：

```tsx
// 解法 1：把 count 放进依赖数组（effect 跟着重建）
useEffect(() => {
  const timerId = setInterval(() => console.log(count), 1000)
  return () => clearInterval(timerId)
}, [count])       // ← 但这样每秒都会销毁重建定时器，浪费

// 解法 2（更好）：用"函数式更新"，不依赖外部值
setSecondsLeft((prev) => prev - 1)
//               ↑ prev 是 React 传进来的【最新值】，不经过闭包捕获
```

**现在你能理解项目 1 里那个设计为什么好了**：

> 倒计时用 `setSecondsLeft((prev) => Math.max(prev - 1, 0))`，**而不是** `setSecondsLeft(secondsLeft - 1)`。
>
> 前者不依赖闭包里的 `secondsLeft`，所以**永远拿到最新值，也就不需要把 `secondsLeft` 放进依赖数组**。

**这就是"函数式更新"的第二个好处**（第一个好处是避免"基于旧值计算"的竞态）。

### 12.3 一句话记住

> **闭包 = 函数记住了它出生时的环境。**
> **在 React 里 = 每个函数记住的是"它被创建那次渲染"的 state 值。**
> **所以：能不依赖闭包就不依赖（用 `(prev) => ...` 这种函数式更新）。**

---

## 13. 常见陷阱清单

| 现象 | 原因 | 修法 |
|---|---|---|
| `Cannot read properties of undefined` | 访问了不存在的属性的属性 | 用 `?.`，或先判断 |
| 界面不动但 `console.log` 数据是对的 | 原地改了对象/数组，引用没变 | 用 `map`/`filter`/`...` 造新的 |
| `xxx is not a function` | 忘了 `await`，拿到的是 Promise | 补 `await` |
| 打印顺序和写的顺序不一样 | 异步任务不阻塞 | 理解事件循环，别依赖执行顺序 |
| 后端明明报错但前端没反应 | 忘了检查 `response.ok` | 显式判断状态码 |
| 循环里 `setTimeout` 打印的都是一样的值 | 闭包捕获 + `var` | 用 `let`，或用函数式更新 |
| `0` 被渲染到页面上 | `{0 && <div>}` 返回 `0` | 写成 `{count > 0 && ...}` |
| `'1' == 1` 居然是 `true` | 松散相等 | 永远用 `===` |
| 数组排序后原数组也变了 | `sort()` 是原地修改 | `[...arr].sort()` |
| 改了深层对象，原对象也变了 | `...` 只做浅拷贝 | 每一层都要展开 |

---

## 14. 自测题

**不看讲义，试着回答。答不上来就回去看对应章节。**

### 基础语法

1. `const` 声明的对象，为什么还能改它的字段？（第 2.2 节）
2. `const [a, b] = ...` 和 `const { a, b } = ...` 有什么区别？（第 4 节）
3. `{ ...task, done: true }` 里，`done` 为什么能覆盖原来的值？（第 5.1 节）
4. `...arr` 为什么只做浅拷贝？深层对象会怎样？（第 5.3 节）
5. `onClick={fn}` 和 `onClick={fn()}` 有什么区别？（第 6.4 节）

### 数组方法

6. `map` 和 `filter` 的回调返回值有什么本质区别？（第 7.3 节）
7. 为什么"删除一项"用 `filter` 而不是 `map`？（第 7.3 节）
8. `[...arr].sort()` 为什么要先复制？（第 3.2 节）

### TypeScript

9. `useState<Task[]>` 里的 `<Task[]>` 是干什么的？如果不写会怎样？（第 9.5 节）
10. `as Task[]` 会做运行时检查吗？（第 9.6 节）

### 异步（重点）

11. `await` 会"卡住整个页面"吗？（第 11.6 节）
12. 请求返回 404 时，`fetch` 会抛错吗？（第 11.8 节）
13. 为什么 `response.json()` 前面也要加 `await`？（第 11.9 节）
14. `async` 函数一定返回什么？（第 11.5 节）

### 闭包

15. `useEffect` 里为什么 `console.log(count)` 总是打印旧值？（第 12.2 节）
16. `setSecondsLeft((prev) => prev - 1)` 为什么不需要把 `secondsLeft` 放进依赖数组？（第 12.2 节）

**能答完这 16 题，JS/TS 这个地基就算补上了。**

---

## 15. 下一步

补完这份讲义后，你会明显感觉不一样：

- 读 `src/App.tsx` 时，每一行都能说出"这是什么语法、为什么这么写"
- 写项目 2 的 `fetch` 调用时，不会卡在 `await` 上
- 遇到 `Cannot read properties of undefined` 时，知道该往哪看

**接下来要补的两份材料**（按顺序）：

| 文档 | 内容 |
|---|---|
| `02-useEffect与持久化讲义.md` | `useEffect` 三种形态、清理函数、依赖数组、`localStorage`、惰性初始化、单向数据流 |
| 第 1 周讲义补充 | 加一节 `event.preventDefault()`（默认行为、判断标准、`button` 默认 `type="submit"` 的陷阱） |

**然后就正式进入项目 2 的前端部分**（Next.js + 调用后端接口）。

---

## 附：一份"查得动"的速查表

```js
// ── 变量 ──
const x = 1            // 不能重新赋值（但对象内容可改）
let y = 2              // 可以重新赋值
// 不用 var

// ── 解构 ──
const [a, b] = arr                    // 按位置
const { name, age } = obj             // 按属性名
const { title: t = '默认' } = obj      // 重命名 + 默认值
function F({ task, onToggle }) {}      // 参数里解构

// ── 展开 ──
[...arr, x]                  // 数组增
{ ...obj, key: value }        // 对象改字段（浅拷贝）
const { id, ...rest } = obj   // 剩余参数
function f(...args) {}        // 收集参数

// ── 数组方法（都不改原数组）──
arr.map(x => 变形)            // 长度不变
arr.filter(x => 布尔)         // 保留返回 true 的
arr.find(x => 布尔)           // 第一个匹配的元素 / undefined
arr.some(x => 布尔)           // 有没有符合条件的
arr.every(x => 布尔)          // 是不是全都符合

// ── 原地修改（React 里避免）──
arr.push(x)  arr.splice()  arr.sort()  arr.reverse()

// ── 运算符 ──
`${a}:${b}`          // 模板字符串
cond ? A : B         // 三元
a && b   a || b      // 短路
a ?? b               // 只有 null/undefined 才用 b
obj?.prop            // 可选链
a === b              // 严格相等（永远用它）

// ── TypeScript ──
type T = { a: number; b?: string }     // 类型声明，? 表示可选
let x: number | string                 // 联合
type F = 'a' | 'b'                     // 字面量联合
function f<T>(arr: T[]): T {}          // 泛型
value as Task[]                        // 类型断言（不做运行时检查）

// ── 异步 ──
async function f() {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()      // ← json() 也要 await
    return data
  } catch (e) {
    console.error(e)
  }
}
```
