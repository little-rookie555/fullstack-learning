import { useEffect, useState } from 'react'
import './App.css'

// 数据的样子
type Task = {
  id: number
  title: string
  done: boolean
}

// 筛选的三种取值
type Filter = 'all' | 'active' | 'done'

// 筛选项的配置
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

// 一个番茄的长度：25 分钟 = 1500 秒
const FOCUS_SECONDS = 25 * 60

// ===========================================================================
// TODO(你来写·第 1 处)：把秒数格式化成 "mm:ss"
// ---------------------------------------------------------------------------
// 目标效果：
//   1500 → "25:00"
//   65   → "01:05"
//   9    → "00:09"
//
// 提示（按顺序做）：
//   1. 分钟 = Math.floor(totalSeconds / 60)
//   2. 秒   = totalSeconds % 60
//   3. 补零：String(值).padStart(2, '0')
//      padStart 的意思是"不足 2 位就在前面补 '0'"
//   4. 最后用模板字符串拼起来：`${分钟}:${秒}`
//
// 现在这行是错的（界面上会显示 "1500" 这种数字），把它改对。
// ===========================================================================
function formatTime(totalSeconds: number) {
  return String(totalSeconds)
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  // 番茄钟的两个状态
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS)
  const [isRunning, setIsRunning] = useState(false)

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

  // =========================================================================
  // TODO(你来写·第 3 处)：开始 / 暂停
  // -------------------------------------------------------------------------
  // 要做的事情只有一件：把 isRunning 取反。
  // 提示：用函数形式 setIsRunning((prev) => !prev)
  //
  // 注意按钮文字会自己跟着变（isRunning 为 true 时显示"暂停"），
  // 你不需要手动改按钮 —— 那部分已经在 JSX 里写好了。
  // =========================================================================
  function toggleRunning() {
    // 在下面写
  }

  // 重置：恢复成 25 分钟并停止计时
  // （这个我写好了，作为"一次修改两个 state"的示例）
  function resetTimer() {
    setIsRunning(false)
    setSecondsLeft(FOCUS_SECONDS)
  }

  // =========================================================================
  // TODO(你来写·第 2 处)：倒计时的核心 —— 本周最重要的一段代码
  // -------------------------------------------------------------------------
  // 步骤：
  //   1. 如果 !isRunning，直接 return（不运行的时候就什么都不做）
  //   2. 用 setInterval(要执行的函数, 1000) 每 1 秒执行一次
  //      里面的逻辑是：setSecondsLeft((prev) => prev - 1)
  //   3. setInterval 会返回一个"定时器编号"，
  //      把它存到变量里，例如 const timerId = setInterval(...)
  //   4. 最后 return 一个函数，在里面调用 clearInterval(timerId)
  //
  // 关于第 4 步（关键）：
  //   这个被 return 出去的函数叫"清理函数"。
  //   React 会在两个时机替你调用它：
  //     a) 下次要重新执行这个 effect 之前
  //     b) 组件被卸载时
  //   如果忘了写它，每次重新执行都会多留下一个定时器在跑，
  //   现象是：暂停再开始，数字越跳越快（一秒减 2、减 3 ……）
  //
  // 依赖数组 [isRunning] 我写好了：意思是"只有 isRunning 变了才重新执行这个 effect"。
  // 所以点开始 → effect 重跑 → 建定时器；点暂停 → 清理函数被调用 → 定时器停掉。
  // =========================================================================
  useEffect(() => {
    if (!isRunning) return

    // 在下面写第 2、3、4 步
  }, [isRunning])

  // 进阶挑战（可选）：
  //   现在倒计时会一直减成负数。让它到 0 就自动停下，并确保按钮变回"开始"。
  //   提示：可以在 setSecondsLeft 的更新函数里判断，也可以再加一个 effect。

  const doneCount = tasks.filter((task) => task.done).length

  // 派生数据：当前该显示哪些任务
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.done
    if (filter === 'done') return task.done
    return true
  })

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

      {/* 番茄钟 */}
      <section className="timer">
        <p className="timer-display">{formatTime(secondsLeft)}</p>
        <div className="timer-controls">
          <button
            className="timer-button"
            type="button"
            onClick={toggleRunning}
          >
            {isRunning ? '暂停' : '开始'}
          </button>
          <button
            className="timer-button timer-button--ghost"
            type="button"
            onClick={resetTimer}
          >
            重置
          </button>
        </div>
      </section>

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
