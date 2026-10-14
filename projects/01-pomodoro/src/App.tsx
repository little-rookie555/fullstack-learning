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
// const FOCUS_SECONDS = 5

// 把秒数格式化成 "mm:ss"，例如 1500 → "25:00"
function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
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

  // 开始 / 暂停
  function toggleRunning() {
    setIsRunning((prev) => !prev)
  }

  // 重置：恢复成 25 分钟并停止计时
  // （这个我写好了，作为"一次修改两个 state"的示例）
  function resetTimer() {
    setIsRunning(false)
    setSecondsLeft(FOCUS_SECONDS)
  }

  // 倒计时：只有 isRunning 为 true 时才创建定时器。
  // 清理函数是必须的 —— 忘了它，每次重新执行都会多留一个定时器在跑，
  // 现象是"暂停停不住"以及"再开始后一秒减 2"。
  useEffect(() => {
    if (!isRunning) return

    const timerId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === 0) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [isRunning])

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
