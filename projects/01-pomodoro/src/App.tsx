import { useState } from 'react'
import './App.css'

// 数据的样子
type Task = {
  id: number
  title: string
  done: boolean
}

// 筛选的三种取值。这是 TypeScript 的"字面量联合类型"：
// Filter 只能是 'all' | 'active' | 'done' 这三个字符串之一，
// 写成 'Active' 或 'complete' 会立刻报错。
type Filter = 'all' | 'active' | 'done'

// 筛选项的配置。用数组存起来，界面上就能用 map 渲染出三个按钮，
// 而不用手写三遍几乎一样的 JSX。
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
    // TODO(你来写·第 1 处)：下面这两个判断写反了，请改对。
    //   filter 是 'active' 时应该显示"未完成"的任务
    //   filter 是 'done'   时应该显示"已完成"的任务
    // 现在的症状：点"未完成"看到的是已完成的，点"已完成"看到的是未完成的。
    if (filter === 'active') return task.done
    if (filter === 'done') return !task.done
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
            onClick={() => {
              // TODO(你来写·第 2 处)：把当前选中的筛选项改成 item.value。
              // 现在写死成 'all'，所以你点"未完成""已完成"都不会切换。
              setFilter('all')
            }}
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
