// utils/markdown.js 修改为：
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js' // 引入高亮
import 'highlight.js/styles/atom-one-dark.css' // 在主入口或者这里引入你喜欢的样式

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch {
        // 忽略高亮错误，使用默认处理
      }
    }
    return ''; // 使用额外的默认转义
  }
})

export function renderMarkdown(content) {
  return md.render(String(content || ''))
}
