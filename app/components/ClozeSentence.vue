<script setup lang="ts">
/**
 * Render a tokenized sentence with one token replaced by a blank "slot". The
 * default slot lets the parent inject an input or the revealed answer.
 */
const props = defineProps<{ tokens: string[]; clozeIndex: number }>()

const before = computed(() => props.tokens.slice(0, props.clozeIndex).join(''))
const after = computed(() => props.tokens.slice(props.clozeIndex + 1).join(''))
</script>

<template>
  <p class="text-2xl font-medium leading-relaxed sm:text-3xl">
    <span>{{ before }}</span>
    <span class="mx-0.5 inline-block align-baseline"><slot /></span>
    <span>{{ after }}</span>
  </p>
</template>
