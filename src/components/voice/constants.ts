export const MODEL_URL = 'https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz'

export const WORDS_TO_NUMBERS: Record<string, number> = {
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
}

export const WORDS_TO_KEYS: Record<string, string> = {
  'up': 'ArrowUp',
  'down': 'ArrowDown',
  'left': 'ArrowLeft',
  'right': 'ArrowRight',
}

const MUMBLING_WORDS = [
  'oh',
  'um',
  'uh',
  'hmm',
  'huh',
]

export const GRAMMAR = [
  'row', 'column', 'digit',
  // TODO: add all commands
  // 'put', 'write',
  // undo, redo
  // help, hint

  ...MUMBLING_WORDS,
  ...Object.keys(WORDS_TO_KEYS),
  ...Object.keys(WORDS_TO_NUMBERS)
]
