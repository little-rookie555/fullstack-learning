import { useState } from 'react'

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
  { id: 2, title: '理解 JSX 到底是什么', done: false },
  { id: 3, title: '把界面拆成组件', done: false },
  { id: 4, title: '想明白 useState 为什么能刷新界面', done: false },
]

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

  // 派生数据：能算出来的就别再存一份状态，否则迟早不同步
  const doneCount = tasks.filter((task) => task.done).length

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-950 p-6 text-slate-100">
      <div className="w-full max-w-md">
        <header className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold tracking-tight">我的任务</h1>
          <span className="text-sm text-slate-400">
            {doneCount} / {tasks.length} 已完成
          </span>
        </header>

        {/* 第 3 步：列表渲染。
            .map() 把"数据数组"翻译成"组件数组"。
            key 不是给用户看的，是给 React 用来识别每一项的身份的，
            换成索引做 key 会在增删时出现错位 bug。 */}
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
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        className="flex w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-left transition-colors hover:border-slate-600"
      >
        {/* className 用模板字符串根据状态切换样式，
            这是 Tailwind 里最常见的条件样式写法 */}
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded border text-xs ${
            task.done
              ? 'border-emerald-500 bg-emerald-500 text-slate-950'
              : 'border-slate-600'
          }`}
        >
          {task.done ? '✓' : ''}
        </span>

        <span className={task.done ? 'text-slate-500 line-through' : ''}>
          {task.title}
        </span>
      </button>
    </li>
  )
}
