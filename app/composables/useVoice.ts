/**
 * Tiny wrapper over the browser SpeechSynthesis API for pronouncing sentences.
 * Works offline, no network/keys. No-ops during SSR or when unsupported.
 */
export function useVoice() {
  const supported = import.meta.client && typeof window !== 'undefined' && 'speechSynthesis' in window

  function speak(text: string, lang: string) {
    if (!supported || !text) return
    const synth = window.speechSynthesis
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    // Map our 2-letter codes to BCP-47 tags the browser expects.
    const localeMap: Record<string, string> = { es: 'es-ES', fr: 'fr-FR', de: 'de-DE', en: 'en-US' }
    utterance.lang = localeMap[lang] ?? lang
    utterance.rate = 0.95
    synth.speak(utterance)
  }

  return { supported, speak }
}
