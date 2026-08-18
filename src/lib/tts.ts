export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find((v) => v.lang.startsWith('en'));
  if (enVoice) utter.voice = enVoice;
  utter.lang = enVoice?.lang ?? 'en-US';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}
