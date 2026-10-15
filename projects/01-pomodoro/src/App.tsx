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

// 一个番茄的长度：25 分钟 = 1500 秒
const FOCUS_SECONDS = 25 * 60

// localStorage 里的键名。
// localStorage 是一个"字符串到字符串"的字典，所有站点共享同一个空间，
// 所以键名要自己起得够明确，避免和别的项目撞车。
const STORAGE_KEY = 'pomodoro.tasks'

// ===========================================================================
// TODO(你来写·第 1 处)：从 localStorage 读回上次保存的任务
// ---------------------------------------------------------------------------
// localStorage 只有一个读接口：localStorage.getItem(键名)
// 它的特点是：
//   · 键不存在时返回 null
//   · 取出来的是【字符串】，不是数组，必须自己解析
//
// 你需要写：
//   1. 用 getItem(STORAGE_KEY) 取出原始字符串
//   2. 如果拿到的是 null（第一次打开），直接 return initialTasks
//   3. 用 JSON.parse() 把字符串变回数组
//   4. 兜底：解析可能失败（比如数据被手动改坏了），所以要用 try / catch，
//      catch 里 return initialTasks
//   5. 再兜一层：解析出来的如果不是数组，也 return initialTasks
//      提示：Array.isArray(解析结果)
//
// 为什么必须兜底：localStorage 是用户可见可改的（F12 → Application 里能直接编辑）。
// 如果数据坏了还直接 JSON.parse，会抛错导致整个页面白屏。
//
// 现在这行是"永远返回初始数据"，也就是说还不会持久化。把它改对。
// ===========================================================================
function loadTasks(): Task[] {
  const saved = localStorage.getItem(STORAGE_KEY)

  // 第一次打开时键不存在，getItem 返回 null，给初始数据
  if (saved === null) return initialTasks

  // TODO(你来写·第 1 处)：从这里往下才是你要写的东西
  //   1. 用 JSON.parse(saved) 把字符串变回数组
  //   2. 包在 try / catch 里 —— 数据可能被手动改坏，解析会抛错，
  //      catch 里返回 initialTasks（不兜底的话，页面直接白屏）
  //   3. 再检查一下 Array.isArray(解析结果)，不是数组也返回 initialTasks
  //   4. 都通过就返回解析结果
  //
  // 现在这里直接返回初始数据，所以【还不会恢复上次的任务】，把它改对。
  return initialTasks
}

// ===========================================================================
// TODO(你来写·第 3 处)：这段 id 生成逻辑有个隐藏 bug，加了持久化之后才会暴露
// ---------------------------------------------------------------------------
// 现在的算法：idCounter 从 initialTasks 的长度算起（= 3），每调用一次加 1。
//
// 问题在哪：
//   idCounter 是【模块级变量】，只在页面加载时初始化一次，
//   它并不知道 localStorage 里已经有几条任务、最大的 id 是多少。
//
// 具体会怎么爆：
//   1. 你加了 4 条任务，最后一条的 id 是 7
//   2. 刷新页面 → tasks 从 localStorage 读回，id 是 1~7
//   3. 但 idCounter 又被重新初始化成 3
//   4. 再加一条新任务 → id = 4 → 【和已有的 id 4 撞了】
//
// 症状：
//   · 控制台报 "Encountered two children with the same key"
//   · 点某一条任务打勾，结果另一条也变了（React 认错了元素）
//
// 怎么修（方向）：
//   别在模块级维护计数器。id 应该"从当前 tasks 里现算出来"——
//   把 createId 去掉，改成在 addTask 的 setTasks 更新函数里算下一个 id。
//   这样无论数据从哪来、有多少条，算出来的 id 一定不会重复。
// ===========================================================================
let idCounter = initialTasks.length

function createId() {
  idCounter = idCounter + 1
  return idCounter
}

export default function App() {
  // 注意这里是 useState(loadTasks)，传的是"函数本身"，不是 useState(loadTasks())。
  // 这叫"惰性初始化"：React 只会在第一次渲染时调用 loadTasks 一次。
  // 如果写成 loadTasks()，那么每次渲染都会读一遍 localStorage + 解析一遍 JSON，
  // 纯属浪费（结果还一样）。
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
  // 这里没有定时器、没有请求，只是"监听 secondsLeft 的变化"——
  // 这是 useEffect 最常用的第二种形态。
  useEffect(() => {
    if (secondsLeft === 0) setIsRunning(false)
  }, [secondsLeft])

  // =========================================================================
  // TODO(你来写·第 2 处)：把 tasks 存进 localStorage
  // -------------------------------------------------------------------------
  // 要做的事情很简单，只有一行：
  //   localStorage.setItem(键名, JSON.stringify(tasks))
  //
  // 为什么用 JSON.stringify：localStorage 只能存字符串，
  //   而 tasks 是数组，必须先序列化。
  //
  // 为什么依赖数组是 [tasks]：
  //   意思是"只要 tasks 变了，就重新执行一次这个 effect"——
  //   于是每次增、删、改任务之后，最新的数据都会自动写进去。
  //   这就是"监听状态变化"这种 effect 的典型用法。
  //
  // 注意整体的数据流是【单向】的：
  //   启动时读一次（loadTasks，只在首次渲染）+ 变化时写一次（这个 effect）
  //   不要试图让 localStorage 变成"数据源"，它只是一个备份仓库。
  // =========================================================================
  useEffect(() => {
    // 在下面写
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
