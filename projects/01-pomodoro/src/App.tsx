import { useRef, useState } from 'react'

/* =========================================================================
   Tailwind 到底是什么？
   -------------------------------------------------------------------------
   每个 className 就是一条"提前写好的 CSS 声明"。
     flex     →  display: flex
     p-6      →  padding: 1.5rem
     text-sm  →  font-size: 0.875rem
   没有编译魔法，也没有运行时开销 —— 最后生成的还是普通 CSS。

   命名规则（搞懂规则就不用背类名了）：

   1) 前缀 = 对应哪个 CSS 属性
        p-       padding              m-        margin
        gap-     gap                  space-y-  子元素之间的纵向间距
        w-       width                h-        height
        size-    width + height 一起（等于 w-5 h-5）
        bg-      background-color     text-     color 或 font-size
        border-  border               rounded-  border-radius
        flex / grid / items- / justify-    布局
        font-    字重 / 字体

   2) 数值 = 0.25rem 的倍数（1 单位 = 4px，这是最需要记的一条）
        p-1 → 4px    p-2 → 8px    p-4 → 16px    p-6 → 24px    p-8 → 32px
        注：rem 是"相对根字号"的单位，1rem = 16px（默认）

   3) 变体前缀用冒号，表示"满足什么条件时才生效"
        hover:bg-red-500    鼠标悬停时改变背景色
        focus:ring-2        获得键盘焦点时显示外圈
        md:flex-row         屏幕宽度 ≥768px 时（md 是断点）
        dark:bg-black       系统处于深色模式时

   4) 颜色名 = 色板 + 深浅号
        slate / zinc / gray  → 三种不同倾向的灰（slate 偏冷、zinc 偏中性）
        emerald / red / blue → 绿 / 红 / 蓝
        数字 50 → 950 由浅到深，50 最浅、950 最深

   ※ 类名写的顺序不影响最终效果（CSS 优先级由 Tailwind 内部固定），
     但社区习惯按"布局 → 盒模型 → 排版 → 颜色 → 交互"排列，方便阅读。
     下面所有 className 都按这个顺序写。
   ========================================================================= */

/* =========================================================
   第 1 步：先用"类型"把数据的样子描述清楚
   TypeScript 在这里的价值：写错字段名会立刻报错，
   而不是等到浏览器里渲染出 undefined 才发现。
   ========================================================= */
type Task = {
  id: number
  title: string
  done: boolean
}

const initialTasks: Task[] = [
  { id: 1, title: '装好开发环境，跑起 npm run dev', done: true },
  { id: 2, title: '理解 JSX 到底是什么。', done: false },
  { id: 3, title: '把界面拆成组件。', done: false },
  { id: 4, title: '想明白 useState 为什么能刷新界面。', done: false },
  { id: 5, title: '把任务列表改成受控组件。', done: false },
]

/* =========================================================
   生成新任务的唯一 id
   -------------------------------------------------------------------------
   为什么需要它：<TaskItem key={task.id} /> 里的 key 必须唯一。
   为什么不能用 tasks.length 当 id：
     因为"删掉一条再新增"会算出重复的 id，React 会认错元素、界面错乱。
   ※ 真实项目里 id 通常由数据库生成（自增主键或 UUID），这里先用计数器模拟。
   ========================================================= */
let idCounter = Math.max(...initialTasks.map((task) => task.id))

function createId() {
  idCounter += 1
  return idCounter
}

/* =========================================================
   组件就是一个"返回 JSX 的函数"。
   注意函数名必须大写开头 —— 这是 React 区分
   "内置标签 <div>" 和 "你自己的组件 <TaskItem>" 的唯一依据。
   ========================================================= */
export default function App() {
  /* 第 2 步：声明状态。
     tasks 是"当前值"，setTasks 是"修改它的唯一方式"。
     记住这句话：不要直接改 tasks，永远通过 setTasks 改。
     React 就是靠"你调用了 setTasks"这个信号，才知道要重新渲染。 */
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  /* 【本次新增 · 状态 2】draft = 输入框里"正在打的那行字"
     -------------------------------------------------------------------------
     判断标准很简单：界面上有东西会随时间变化，它就该是 state。
     反过来，从头到尾都不变的东西，不要放进 state。
     初始值是空字符串 ''，TypeScript 会据此推断它的类型是 string。 */
  const [draft, setDraft] = useState('')

  /* 【本次新增 · 工具】inputRef = 指向真实 <input> DOM 元素的"遥控器"
     -------------------------------------------------------------------------
     useRef 和 useState 的区别（重要）：
       useState → 值变了，会触发重新渲染
       useRef   → 值变了，不会触发重新渲染
     我们只是想在添加完任务后调用元素自身的 .focus()，
     不需要因为"拿到了这个元素"而重新渲染，所以用 useRef 而不是 useState。

     类型里的 | null：首次渲染时元素还没被挂到页面上，所以可能是 null。
     这就是下面要写 inputRef.current?.focus() 里那个 ? 的来源。 */
  const inputRef = useRef<HTMLInputElement>(null)

  function toggleTask(id: number) {
    /* 这里演示了 React 里最常写的"更新数组里某一项"的写法。
       为什么不直接改？因为要造出一个"新数组"，
       React 通过比较新旧引用来判断是否变化（这叫不可变更新）。 */
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }

  /* 【本次新增】添加任务
     -------------------------------------------------------------------------
     注意这里连着调用了两次 set（setTasks 和 setDraft）。
     这是安全的：React 会把同一个事件处理函数里的多次更新合并成一次重新渲染，
     界面不会中间闪一下。 */
  function addTask() {
    // 边界 1：trim() 去掉首尾空格后如果为空，就什么都不做。
    // 不加这行的话能添加出一条"看不见的空任务"，白白占掉一个 id 和一行高度。
    const title = draft.trim()
    if (title === '') return

    // 不可变新增：新数组 = 旧数组展开 + 新的一项。
    // 为什么不能写 tasks.push(...)？
    // 因为 push 是"原地修改"，数组引用没变，
    // React 比较新旧状态时看到的是同一个引用，会认为没变化而跳过渲染。
    // 记住这条规律：改对象用 {...}，改数组用 map / filter / [...展开]。
    setTasks((prev) => [...prev, { id: createId(), title, done: false }])

    // 清空输入框。
    // 因为输入框是受控的（value={draft}），把 state 清空就等于清空输入框，
    // 完全不需要去操作 DOM。这就是受控组件省事的地方。
    setDraft('')

    // 边界 2：把光标送回输入框，方便连续添加多条，不用每次都用鼠标点。
    // current 可能是 null，?. 的意思是"如果它不是 null 才调用"。
    inputRef.current?.focus()
  }

  // 派生数据：能算出来的就别再存一份状态，否则迟早不同步
  const doneCount = tasks.filter((task) => task.done).length

  return (
    /* 最外层容器：
         flex           → display: flex（开启弹性布局）
         min-h-screen   → min-height: 100vh（至少占满一屏高度）
         items-start    → align-items: flex-start（交叉轴=纵轴，靠上对齐）
         justify-center → justify-content: center（主轴=横轴，水平居中）
         bg-zinc-900    → background-color（zinc 灰阶的 900 号，接近纯黑）
         p-6            → padding: 1.5rem（= 24px）
         text-slate-100 → color（很浅的冷灰白，深色背景上比纯白柔和）

       为什么用 min-h-screen + flex 而不是直接居中？
       因为这决定了"内容变多时页面能正常往下长"，而不是被压扁。 */
    <div className="flex min-h-screen items-start justify-center bg-zinc-900 p-6 text-slate-100">
      {/* 内容区：
           w-full   → width: 100%（先撑满父容器）
           max-w-md → max-width: 28rem（= 448px，再限制上限）

          w-full 和 max-w-md 必须成对出现：
          w-full 负责"手机上占满"，max-w-md 负责"大屏上别拉太长"。
          这是响应式布局最常见的一个组合。 */}
      <div className="w-full max-w-md">
        {/* 标题行：
             flex           → display: flex
             items-baseline → align-items: baseline（按文字基线对齐，
                              这样不同字号的标题和计数看起来才是齐的）
             justify-between→ justify-content: space-between（两端顶开）
             ※ 不加 justify-between 的话，两个元素会挤在左边 */}

        {/* 标题：
             text-2xl     → font-size: 1.5rem + line-height: 2rem
                            （Tailwind 的字号类会同时设行高，这是它的贴心之处）
             font-bold    → font-weight: 700
             tracking-tight → letter-spacing: -0.025em（大字号收紧字距更好看）*/}

        {/* 计数：
             text-sm      → font-size: 0.875rem
             text-slate-400 → color（比标题浅，形成层级关系）
             排版的核心就是"对比"：靠字号和颜色深浅区分主次 */}
        <header className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold tracking-tight">我的任务</h1>
          <span className="text-sm text-slate-400">
            {doneCount} / {tasks.length} 已完成
          </span>
        </header>

        {/* 【本次新增】添加任务的表单
        -------------------------------------------------------------------------
        为什么用 <form> 而不是给按钮直接加 onClick？
        因为 <form> 自带一个免费的好处：在输入框里按回车 = 提交。
        否则用户必须用鼠标去点"添加"，这是很差的体验。

        event.preventDefault() 是必须的！
        <form> 的默认行为是"提交后刷新整个页面"，
        在 React 里这会把所有 state 清空、界面闪一下回到初始状态。
        preventDefault 就是"阻止默认行为"。
        ------------------------------------------------------------------------- */}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            addTask()
          }}
          className="mt-5 flex gap-2"
        >
          {/* 输入框 —— 受控组件
              value={draft}    → 输入框显示什么，完全由 state 决定
              onChange={...}   → 用户每敲一个字，就把新值写回 state

              这两行加起来就叫"受控组件"，数据流是：
                  敲键盘 → onChange → setDraft → 重新渲染 → 输入框显示新值
              好处是 state 永远是唯一的真相：要做校验、清空、格式化，
              都只需要操作 state，不用去操作 DOM。

              className 里三个没见过的写法：
                placeholder:text-slate-500 → 只给 placeholder 文字上色
                focus:outline-none         → 去掉浏览器默认的黑色聚焦圈
                focus:border-emerald-500   → 换成自己的绿色边框，明确告诉用户
                                             "你现在打字打在这里"（别省这行，
                                             键盘操作的人全靠它） */}
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="添加一个新任务，回车确认"
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />

          {/* 提交按钮
                flex-1 给了输入框、按钮不设宽度 → 按钮按内容自适应，
                输入框吃掉剩下的空间。这就是 flex 布局省心的地方，
                不用算具体像素。
                type="submit" → 点击它等于提交表单（会触发上面的 onSubmit） */}
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-400"
          >
            添加
          </button>
        </form>

        {/* 第 3 步：列表渲染。
            .map() 把"数据数组"翻译成"组件数组"。
            key 不是给用户看的，是给 React 用来识别每一项的身份的，
            换成索引做 key 会在增删时出现错位 bug。

            列表容器：
              mt-6     → margin-top: 1.5rem（和上方表单拉开距离）
              space-y-2→ 给所有直接子元素加上"响应式纵向间距"
                         实际编译成：& > * + * { margin-top: 0.5rem }
                         它比让每个 <li> 自己写 mt-2 更干净，
                         因为首尾不会多出多余间距 */}
        <ul className="mt-6 space-y-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </ul>
      </div>
    </div>
  )
}

/* =========================================================
   第 4 步：把列表项抽成独立组件。
   组件通过 props 接收外部数据 —— props 是只读的，
   子组件不能修改它，想改必须调用父组件传下来的函数。
   "数据向下流、事件向上抛"，这是 React 的核心数据流。
   ========================================================= */
type TaskItemProps = {
  task: Task
  onToggle: (id: number) => void
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <li>
      {/* 整行按钮（点哪都能切换，比只点小方框友好）：
           flex           → display: flex
           w-full         → width: 100%（按钮默认不会撑满，要显式声明）
           items-center   → align-items: center（小方框和文字垂直居中）
           gap-3          → gap: 0.75rem（子元素之间的间距，比 margin 干净）
           rounded-lg     → border-radius: 0.5rem（= 8px）
           border         → border-width: 1px
           border-slate-800 → border-color（比背景稍亮一点点，形成轮廓）
           bg-slate-900   → background-color（比外层容器稍亮，形成"卡片浮起来"）
           px-4 py-3      → 左右 padding 1rem / 上下 padding 0.75rem
           text-left      → text-align: left（button 默认居中对齐，必须改）
           transition-colors → 颜色变化时加 150ms 过渡动画，
                               不加的话 hover 效果会很生硬
           hover:border-slate-600 → 悬停时边框变亮（"这个可以点"的反馈）
           
           ※ gap 和 margin 的区别：gap 只在子元素"之间"生效，
             不会在首尾多出间距，所以布局间距优先用 gap。*/}
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-left transition-colors hover:border-slate-600"
      >
        {/* 勾选框：
             className 用模板字符串根据状态切换样式，
             这是 Tailwind 里最常见的条件样式写法（后期可以引入 clsx 简化）

             固定部分：
               flex            → display: flex
               size-5          → width + height 都是 1.25rem（等于 w-5 h-5）
               shrink-0        → flex-shrink: 0（禁止被压缩！
                                 不加的话，任务文字很长时这个方框会被挤扁）
               items-center / justify-center → 让 √ 在方框里居中
               rounded         → border-radius: 0.25rem（小圆角）
               border          → border-width: 1px
               text-xs         → font-size: 0.75rem（√ 字号调小一点）

             条件部分（未完成 → 已完成）：
               'border-emerald-500 bg-emerald-500 text-slate-950'
                  → 边框和背景都变成翠绿，√ 用接近黑的深色（深色文字压亮色底）
               'border-slate-600'
                  → 只留一个灰边框，表示"还没完成"

             ※ 关键点：两组样式必须覆盖同一批属性，切换时才能干净替换。*/}
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded border text-xs ${
            task.done
              ? 'border-emerald-500 bg-emerald-500 text-slate-950'
              : 'border-slate-600'
          }`}
        >
          {task.done ? '✓' : ''}
        </span>

        {/* 任务文字：
             task.done ? 'text-slate-500 line-through' : ''
               → 已完成：文字变暗 + 加删除线
               → 未完成：不加任何类（空字符串），保持继承的样式
             line-through → text-decoration-line: line-through
             ※ 未完成时返回空字符串而不是 undefined，
               否则 React 会渲染出 "undefined" 这几个字 */}

        {/* flex 布局下，flex-1 可以让文字占据剩余宽度。
             现在只有文字，加不加都一样；等你第 4 步加删除按钮时
             就必须加 flex-1，否则按钮会贴着文字而不是靠右。
             （这是留给你的伏笔）*/}
        <span className={task.done ? 'text-slate-500 line-through' : ''}>
          {task.title}
        </span>
      </button>
    </li>
  )
}
