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

// 初始数据（只在第一次打开、或本地数据坏掉时使用）
const initialTasks: Task[] = [
  { id: 1, title: '装好开发环境，跑起 npm run dev', done: true },
  { id: 2, title: '理解 JSX 是什么', done: false },
  { id: 3, title: '理解 useState 为什么能让界面刷新', done: false },
]

// 一个番茄的长度：25 分钟 = 1500 秒
const FOCUS_SECONDS = 25 * 60

// localStorage 里的键名。localStorage 是所有站点共享的"字符串字典"，
// 所以键名要起得够明确，避免和别的项目撞车。
const STORAGE_KEY = 'pomodoro.tasks'

// 从 localStorage 读回上次保存的任务。
// 每一个可能出问题的地方都留了退路 —— 这是读"外部数据"的通用原则。
function loadTasks(): Task[] {
  const saved = localStorage.getItem(STORAGE_KEY)

  // 第一次打开时键不存在，getItem 返回 null
  if (saved === null) return initialTasks

  try {
    const parsed = JSON.parse(saved)
    // 能解析成功不等于它就是任务数组，再兜一层
    if (Array.isArray(parsed)) return parsed as Task[]
    return initialTasks
  } catch {
    // 数据被改坏导致解析抛错时退回去，而不是让页面白屏
    return initialTasks
  }
}

export default function App() {
  // 传的是"函数本身"而不是 loadTasks()，这叫惰性初始化：
  // React 只在第一次渲染时调用它一次。
  // 写成 loadTasks() 的话，每次渲染都会读一遍 localStorage + 解析一遍 JSON。
  const [tasks, setTasks] = useState<Task[]>(loadTasks)

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

    setTasks((prev) => {
      // 新 id = 现有最大的 id + 1，只能"从数据里现算"。
      // 不能用 prev.length + 1：删掉一条再新增，长度对不上最大的 id，就会撞车。
      const nextId = Math.max(0, ...prev.map((task) => task.id)) + 1
      return [...prev, { id: nextId, title, done: false }]
    })
    setDraft('')
  }

  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  // 开始 / 暂停
  function toggleRunning() {
    setIsRunning((prev) => !prev)
  }

  // 重置：恢复成 25 分钟并停止计时
  function resetTimer() {
    setIsRunning(false)
    setSecondsLeft(FOCUS_SECONDS)
  }

  // effect 1：只管倒计时。更新函数是纯的 —— 只根据 prev 算新值，不产生副作用。
  // 清理函数是必须的，忘了它就会出现"暂停停不住"和"再开始一秒减 2"。
  useEffect(() => {
    if (!isRunning) return
    const timerId = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(timerId)
  }, [isRunning])

  // effect 2：只管"到 0 就停"。
  // 这里没有定时器、没有请求，只是"监听 secondsLeft 的变化"。
  useEffect(() => {
    if (secondsLeft === 0) setIsRunning(false)
  }, [secondsLeft])

  // effect 3：监听 tasks 的变化，把它写进 localStorage。
  // 为什么用 JSON.stringify：localStorage 只能存字符串，数组必须先序列化。
  // 注意整个数据流是单向的：
  //   启动时读一次（loadTasks）+ 变化时写一次（这个 effect）。
  //   不要让 localStorage 变成"数据源"，它只是一个备份仓库。
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

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

// 把秒数格式化成 "mm:ss"，例如 1500 → "25:00"
function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
