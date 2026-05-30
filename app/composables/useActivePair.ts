import { computed } from 'vue'
import { api } from '~~/convex/_generated/api'

/**
 * Resolve the learner's current language pair. Source of truth is the user's
 * `activePairId` (persisted in Convex); falls back to the first available pair
 * when none is set. Because Convex queries are live subscriptions, changing the
 * active pair updates everywhere automatically.
 *
 * Both queries are invoked synchronously before the first `await` so they
 * capture the Nuxt instance context (composables called after an `await` lose
 * it during SSR).
 */
export async function useActivePair() {
  const mePromise = useConvexQuery(api.users.me, {})
  const pairsPromise = useConvexQuery(api.languages.listPairs, {})

  const meQuery = await mePromise
  const pairsQuery = await pairsPromise

  const me = meQuery.data
  const pairs = pairsQuery.data

  const activePairId = computed(
    () => me.value?.activePairId ?? pairs.value?.[0]?._id ?? null,
  )
  const activePair = computed(
    () => pairs.value?.find((p) => p._id === activePairId.value) ?? pairs.value?.[0] ?? null,
  )

  return { me, pairs, activePairId, activePair }
}
