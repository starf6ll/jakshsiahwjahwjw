# Shilov Media redesign
- `index.html` — landing page, chat removed
- `chat.html` — separate responsive AI chat at `/chat`
- `vercel.json` — rewrite for `/chat`
The chat keeps POST `/api/chat` and expects OpenAI-compatible SSE streaming. Lucide, Markdown, KaTeX and syntax highlighting load from CDN.
