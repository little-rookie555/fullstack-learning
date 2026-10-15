"""
书签管理器 —— 后端 API

启动命令（在 backend 目录下）：
    .\\.venv\\Scripts\\python.exe -m uvicorn main:app --reload --port 8000

启动后打开：
    http://127.0.0.1:8000/docs   ← FastAPI 自动生成的交互式接口文档
    http://127.0.0.1:8000/api/health
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# app 是整个后端的入口对象。
# uvicorn 启动命令里的 "main:app" 就是"main.py 这个文件里的 app 变量"。
app = FastAPI(title="书签管理器 API", version="0.1.0")


# ===========================================================================
# CORS（跨源资源共享）—— 这是前后端分离项目遇到的第一个"必修坑"
# ---------------------------------------------------------------------------
# 浏览器的安全策略规定：网页默认只能请求"同源"的接口。
#   同源 = 协议相同 + 域名相同 + 端口相同
#
# 我们的两个服务：
#   前端  http://localhost:3000
#   后端  http://localhost:8000      ← 端口不同，所以是"跨源"
#
# 不配这段的话，前端调用时浏览器会拦下来，控制台报：
#   Access to 'http://localhost:8000/api/xxx' from origin 'http://localhost:3000'
#   has been blocked by CORS policy
#
# ★ 重要认知：这个错"看起来"像后端崩了，其实是【浏览器】拦的，
#   请求可能根本没发到后端。所以排查顺序是：
#     先看浏览器 Console → 再看后端终端有没有收到请求的日志。
#   如果后端终端一片空白，说明请求被浏览器拦在了半路。
# ===========================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 只允许前端这一个来源（生产环境要改成真实域名）
    allow_credentials=True,
    allow_methods=["*"],  # 允许 GET / POST / PUT / DELETE 等所有方法
    allow_headers=["*"],
)


# ===========================================================================
# 一个接口的构成：@app.方法("路径") 装饰器 + 一个函数
#
# 路径统一以 /api 开头，这是自己定的约定 ——
# 将来如果前端页面和后端接口部署在同一个域名下，不会撞路径。
# ===========================================================================
@app.get("/api/health")
def health():
    """健康检查接口：用来确认"服务活着、端口通、路径对"。

    返回 dict，FastAPI 会自动把它转成 JSON 响应。
    """
    return {"status": "ok"}


# 书签的假数据（第 4 周会换成真正的数据库）
FAKE_BOOKMARKS = [
    {
        "id": 1,
        "title": "FastAPI 官方文档",
        "url": "https://fastapi.tiangolo.com/",
        "tag": "后端",
    },
    {
        "id": 2,
        "title": "React 官方文档",
        "url": "https://react.dev/",
        "tag": "前端",
    },
    {
        "id": 3,
        "title": "MDN Web Docs",
        "url": "https://developer.mozilla.org/",
        "tag": "参考",
    },
]


# ===========================================================================
# TODO(你来写·第 1 处)：返回书签列表
# ---------------------------------------------------------------------------
# 目标：GET /api/bookmarks  返回上面那个 FAKE_BOOKMARKS 数组
#
# 提示（按顺序）：
#   1. 加一个装饰器：@app.get("/api/bookmarks")
#   2. 写一个函数，里面直接 return FAKE_BOOKMARKS
#   3. 保存后（uvicorn 会 --reload 自动重启）刷新 http://127.0.0.1:8000/docs
#
# 你要观察的是：右上角的接口数量会从 1 个变成 2 个，
# 点开 /api/bookmarks → "Try it out" → "Execute"，能直接看到 JSON 结果。
#
# ★ 为什么这一步值得重视：
#   FastAPI 会根据你的函数签名【自动生成 API 文档】——
#   你不用写任何前端代码，就能在浏览器里验证后端对不对。
#   这是它相比 Flask / Django 最大的优势，也是我选它的主要原因。
# ===========================================================================


# 在下面写你的接口
