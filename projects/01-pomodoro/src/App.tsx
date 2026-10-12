import { useState } from 'react'
import './App.css'

// 数据的样子
type Task = {
  id: number
  title: string
  done: boolean
}

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

  const doneCount = tasks.filter((task) => task.done).length

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

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={toggleTask} />
        ))}
      </ul>
    </div>
  )
}

type TaskItemProps = {
  task: Task
  onToggle: (id: number) => void
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <li>
      <button
        className="task-item"
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
    </li>
  )
}
