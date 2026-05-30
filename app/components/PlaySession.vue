<script setup lang="ts">
import { api } from '~~/convex/_generated/api'
import { buildChoices } from '~~/convex/lib/cloze'
import { masteryLabel } from '~~/convex/lib/srs'

type PlayMode = 'multipleChoice' | 'textInput'

interface Card {
  _id: string
  tokens: string[]
  clozeIndex: number
  clozeWord: string
  translation: string
  distractors: string[]
  hint?: string | null
  hasExplanation?: boolean
  srsLevel: number
  status: string
  isNew: boolean
}

const props = withDefaults(
  defineProps<{ cards: Card[]; langCode: string; mode?: PlayMode; title?: string }>(),
  { mode: 'multipleChoice' },
)

const mode = ref<PlayMode>(props.mode)
const index = ref(0)
const current = computed<Card | null>(() => props.cards[index.value] ?? null)
const total = computed(() => props.cards.length)
const done = computed(() => index.value >= total.value)

const typed = ref('')
const selected = ref<string | null>(null)
const feedback = ref<{ correct: boolean; expected: string; gainedPoints: number } | null>(null)

const answerStreak = ref(0)
const sessionPoints = ref(0)
const sessionCorrect = ref(0)
const answered = ref(0)

const explanation = ref<{ grammar: string; hint: string; example: string } | null>(null)
const aiUnavailable = ref(false)
const showHint = ref(false)

const submitMutation = useConvexMutation(api.play.submitAnswer)
const explainAction = useConvexAction(api.ai.explainSentence)
const { supported: voiceSupported, speak } = useVoice()

function seedFromId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h) || 1
}

const choices = computed(() =>
  current.value ? buildChoices(current.value.clozeWord, current.value.distractors, seedFromId(current.value._id)) : [],
)

const inputEl = ref<HTMLInputElement | null>(null)
watch([current, mode], async () => {
  if (mode.value === 'textInput' && !feedback.value) {
    await nextTick()
    inputEl.value?.focus()
  }
})

async function submit(answer: string) {
  if (!current.value || feedback.value || submitMutation.pending.value) return
  if (!answer.trim()) return
  selected.value = answer
  const res = await submitMutation.execute({
    sentenceId: current.value._id as never,
    answer,
    mode: mode.value,
    answerStreak: answerStreak.value,
  })
  feedback.value = res
  answered.value++
  if (res.correct) {
    sessionCorrect.value++
    answerStreak.value++
    sessionPoints.value += res.gainedPoints
  } else {
    answerStreak.value = 0
  }
}

function submitTyped() {
  submit(typed.value)
}

function next() {
  feedback.value = null
  typed.value = ''
  selected.value = null
  explanation.value = null
  aiUnavailable.value = false
  showHint.value = false
  index.value++
}

async function explain() {
  if (!current.value) return
  const res = await explainAction.execute({ sentenceId: current.value._id as never })
  if (res.available && res.explanation) explanation.value = res.explanation
  else aiUnavailable.value = true
}

function pronounce() {
  if (current.value) speak(current.value.tokens.join(''), props.langCode)
}

function onKeydown(e: KeyboardEvent) {
  if (done.value) return
  if (feedback.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      next()
    }
    return
  }
  if (mode.value === 'multipleChoice') {
    const n = Number(e.key)
    if (n >= 1 && n <= choices.value.length) {
      e.preventDefault()
      submit(choices.value[n - 1]!)
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function choiceClass(choice: string): string {
  if (!feedback.value) return 'btn-secondary justify-start'
  if (choice === feedback.value.expected) return 'btn justify-start bg-emerald-600 text-white'
  if (choice === selected.value) return 'btn justify-start bg-rose-600 text-white'
  return 'btn-secondary justify-start opacity-50'
}
</script>

<template>
  <div>
    <!-- Summary when the queue is exhausted -->
    <div v-if="done" class="card mx-auto max-w-lg p-8 text-center">
      <div class="text-5xl">🎉</div>
      <h2 class="mt-3 text-2xl font-bold">Round complete!</h2>
      <p class="mt-1 text-slate-500">
        You answered {{ answered }} {{ answered === 1 ? 'sentence' : 'sentences' }} and earned
        <span class="font-semibold text-brand-600">{{ sessionPoints }}</span> points.
      </p>
      <div class="mt-4 flex justify-center gap-6 text-sm">
        <div><span class="text-xl font-bold">{{ sessionCorrect }}</span><div class="text-slate-500">correct</div></div>
        <div>
          <span class="text-xl font-bold">{{ answered > 0 ? Math.round((sessionCorrect / answered) * 100) : 0 }}%</span>
          <div class="text-slate-500">accuracy</div>
        </div>
      </div>
      <div class="mt-6 flex justify-center gap-3">
        <slot name="done-actions" />
      </div>
    </div>

    <div v-else-if="current" class="mx-auto max-w-2xl">
      <!-- Progress bar + session meta -->
      <div class="mb-5 flex items-center justify-between gap-4 text-sm text-slate-500">
        <span>{{ title }}</span>
        <span>{{ index + 1 }} / {{ total }}</span>
      </div>
      <div class="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div class="h-full bg-brand-600 transition-all" :style="{ width: `${(index / total) * 100}%` }" />
      </div>

      <div class="card p-6 sm:p-8">
        <div class="mb-4 flex items-center justify-between">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="current.isNew ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'"
          >
            {{ current.isNew ? 'New' : masteryLabel(current.srsLevel) }}
          </span>
          <div class="flex items-center gap-1">
            <button
class="btn-ghost !px-2 !py-1" type="button" title="Toggle mode"
              @click="mode = mode === 'multipleChoice' ? 'textInput' : 'multipleChoice'">
              {{ mode === 'multipleChoice' ? '⌨︎ Type' : '☰ Choices' }}
            </button>
          </div>
        </div>

        <!-- The cloze sentence -->
        <ClozeSentence :tokens="current.tokens" :cloze-index="current.clozeIndex">
          <template v-if="mode === 'textInput' && !feedback">
            <input
              ref="inputEl"
              v-model="typed"
              type="text"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              class="w-40 border-b-2 border-brand-500 bg-transparent px-1 text-center font-semibold focus:outline-none"
              @keydown.enter.prevent="submitTyped"
            >
          </template>
          <template v-else-if="feedback">
            <span
              class="border-b-2 px-1 font-semibold"
              :class="feedback.correct ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600 line-through'"
            >{{ selected || typed || '—' }}</span>
            <span v-if="!feedback.correct" class="ml-1 border-b-2 border-emerald-500 px-1 font-semibold text-emerald-600">
              {{ feedback.expected }}
            </span>
          </template>
          <template v-else>
            <span class="border-b-2 border-slate-400 px-6 text-slate-300">&nbsp;</span>
          </template>
        </ClozeSentence>

        <p class="mt-4 text-slate-500">{{ current.translation }}</p>

        <!-- Hint -->
        <div v-if="current.hint" class="mt-3">
          <button v-if="!showHint && !feedback" class="text-sm text-brand-600 hover:underline" type="button" @click="showHint = true">
            Show hint
          </button>
          <p v-if="showHint || feedback" class="text-sm italic text-slate-500">💡 {{ current.hint }}</p>
        </div>

        <!-- Multiple choice -->
        <div v-if="mode === 'multipleChoice'" class="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            v-for="(choice, i) in choices"
            :key="choice"
            type="button"
            :disabled="!!feedback"
            :class="choiceClass(choice)"
            @click="submit(choice)"
          >
            <span class="mr-2 text-xs opacity-60">{{ i + 1 }}</span>{{ choice }}
          </button>
        </div>

        <!-- Type submit button -->
        <div v-else-if="!feedback" class="mt-6">
          <button class="btn-primary w-full" type="button" :disabled="submitMutation.pending.value" @click="submitTyped">
            Check answer
          </button>
        </div>

        <!-- Feedback panel -->
        <div v-if="feedback" class="mt-6">
          <div
            class="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium"
            :class="feedback.correct ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'"
          >
            <span>{{ feedback.correct ? '✓ Correct' : `✗ Answer: ${feedback.expected}` }}</span>
            <span v-if="feedback.gainedPoints > 0">+{{ feedback.gainedPoints }} pts</span>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button class="btn-primary flex-1" type="button" @click="next">Next →</button>
            <button v-if="voiceSupported" class="btn-secondary" type="button" title="Listen" @click="pronounce">🔊</button>
            <button class="btn-secondary" type="button" :disabled="explainAction.pending.value" @click="explain">
              {{ explainAction.pending.value ? 'Thinking…' : '✨ Explain' }}
            </button>
          </div>

          <!-- AI explanation -->
          <div v-if="explanation" class="mt-3 space-y-2 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm dark:border-brand-500/30 dark:bg-brand-500/10">
            <p><span class="font-semibold">Grammar:</span> {{ explanation.grammar }}</p>
            <p><span class="font-semibold">Hint:</span> {{ explanation.hint }}</p>
            <p><span class="font-semibold">Example:</span> {{ explanation.example }}</p>
          </div>
          <p v-else-if="aiUnavailable" class="mt-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-500 dark:bg-slate-800">
            AI explanations aren’t configured for this deployment.
          </p>
        </div>
      </div>

      <!-- Session footer -->
      <div class="mt-5 flex items-center justify-center gap-6 text-sm text-slate-500">
        <span>🔥 Streak: {{ answerStreak }}</span>
        <span>⭐ {{ sessionPoints }} pts</span>
        <span>{{ sessionCorrect }} / {{ answered }} correct</span>
      </div>
    </div>
  </div>
</template>
