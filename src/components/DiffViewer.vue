<script setup>
import { computed } from 'vue'
import { diff_match_patch } from 'diff-match-patch'

const props = defineProps({
  oldText: { type: String, default: '' },
  newText: { type: String, default: '' },
})

const dmp = new diff_match_patch()

const diffHtml = computed(() => {
  const diffs = dmp.diff_main(props.oldText || '', props.newText || '')
  dmp.diff_cleanupSemantic(diffs)
  return diffs.map(([op, text]) => {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>')
    if (op === 1) return `<ins class="diff-ins">${escaped}</ins>`
    if (op === -1) return `<del class="diff-del">${escaped}</del>`
    return `<span class="diff-eq">${escaped}</span>`
  }).join('')
})
</script>

<template>
  <div class="diff-viewer" v-html="diffHtml" />
</template>

<style scoped>
.diff-viewer {
  font-size: 14px;
  line-height: 1.75;
  word-break: break-word;
  white-space: pre-wrap;
  font-family: inherit;
}
.diff-viewer :deep(.diff-ins) {
  background: rgba(52, 168, 120, 0.18);
  color: #0d6b3a;
  text-decoration: none;
  border-radius: 2px;
  padding: 0 1px;
}
.diff-viewer :deep(.diff-del) {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
  text-decoration: line-through;
  border-radius: 2px;
  padding: 0 1px;
}
.diff-viewer :deep(.diff-eq) {
  color: #2e7a58;
}
</style>
