// Copied a lot of code from https://github.com/ccoreilly/vosk-browser/tree/master/examples/react/src
import { type KaldiRecognizer, Model, createModel } from 'vosk-browser'
import { DuplexOptions, Writable, Duplex } from 'readable-stream'
import MicrophoneStream from 'microphone-stream'
import process from 'process'

import { GRAMMAR, MODEL_URL, WORDS_TO_KEYS, WORDS_TO_NUMBERS } from './constants'
import type { SudokuEventCallbacks } from 'src/utils/keyboard'

// Need to polyfill because microphone-stream uses it
window.process = process

class AudioStreamer extends Duplex {
  constructor(public recognizer: KaldiRecognizer, options?: DuplexOptions) {
    super(options)
  }

  public _write(chunk: AudioBuffer, _encoding: any, callback: any) {
    const buffer = chunk.getChannelData(0)
    if (this.recognizer && buffer.byteLength > 0) {
      this.recognizer.acceptWaveform(chunk)
    }
    callback()
  }
}

interface VoskResult {
  result: Array<{
    conf: number;
    start: number;
    end: number;
    word: string;
  }>;
  text: string;
}

export interface VoiceHandlers {
  onWordsInput?: (words: string) => void
  onWordsInputPreview?: (words: string) => void
  onSelectedCellChange?: SudokuEventCallbacks['onSelectedCellChange']
  onSelectedCellValueChange?: SudokuEventCallbacks['onSelectedCellValueChange']
  onSelectedCellDigitInput?: (value: number | null) => void
  onUndo?: SudokuEventCallbacks['onUndo']
  onRedo?: SudokuEventCallbacks['onRedo']
  onNumbersActive?: () => void
  onCornerMarksActive?: () => void
  onCenterMarksActive?: () => void
}

type InputProcessor = (text: string) => string | undefined

export class Voice {
  private model?: Model
  private micStream?: MicrophoneStream
  private audioBucket: Writable
  private audioStreamer?: AudioStreamer
  private isStarted: boolean
  private INPUT_PROCESSORS: InputProcessor[]

  constructor(private handlers?: VoiceHandlers) {
    this.audioBucket = new Writable({
      write(_chunk, _encoding, callback) {
        callback()
      },
      objectMode: true,
      decodeStrings: false,
    })
    this.isStarted = false

    const voice = this
    this.INPUT_PROCESSORS = [
      this.handleRowColInput, this.handleDigitInput, this.handleDeleteInput,
      this.handleMoveInput, this.handleUndoInput, this.handleRedoInput,
      this.handleNumbersModeInput, this.handleCornerMarksModeInput, this.handleCenterMarksModeInput,
    ].map(fn => fn.bind(voice))
  }

  public async init() {
    console.log('Loading voice')

    this.handlers?.onWordsInput?.('Loading...')

    // Will download once then store it local IndexedDB
    this.model = await createModel(MODEL_URL)
    console.log('Finished setting up model')

    const recognizer = new this.model.KaldiRecognizer(48000, JSON.stringify(GRAMMAR));
    recognizer.setWords(true)
    recognizer.on('result', (message: any) => {
      const result: VoskResult = message.result
      this.handleWordInput(result)
    });
    recognizer.on('partialresult', (message: any) => {
      if (message.result.partial === '') {
        return
      }
      this.handlers?.onWordsInputPreview?.(message.result.partial)
    })

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    })

    this.micStream = new MicrophoneStream({
      objectMode: true,
      bufferSize: 1024,
    })

    this.micStream.setStream(mediaStream)

    this.audioStreamer = new AudioStreamer(recognizer, {
      objectMode: true,
    })

    // Note: do not call this.start() here, we may not want that

    this.handlers?.onWordsInput?.('Loaded')
  }

  public start() {
    if (this.isStarted) {
      return
    }
    this.micStream?.unpipe(this.audioBucket)
    this.micStream?.pipe(this.audioStreamer!)
    console.log('Listening...')
    this.handlers?.onWordsInput?.('Listening...')
    this.isStarted = true
  }

  public pause() {
    if (!this.isStarted) {
      return
    }
    console.log('Pausing...')
    this.micStream?.unpipe(this.audioStreamer!)
    this.micStream?.pipe(this.audioBucket)
    this.isStarted = false
  }

  public close() {
    console.error('CALLING CLOSE()')
    this.model?.terminate()
  }

  public setHandlers(handlers?: VoiceHandlers) {
    this.handlers = {
      ...this.handlers,
      ...handlers
    }
  }

  handleWordInput(result: VoskResult) {
    let text = result.text

    if (text === '') {
      return
    }

    // TODO: filter words based on a confidence threshold?
    // console.log('word input', result.result.map(word => `${word.word}(${word.conf})`))

    this.handlers?.onWordsInput?.(text)

    let foundMatch: boolean
    do {
      foundMatch = false
      for (const processor of this.INPUT_PROCESSORS) {
        const result = processor(text)
        if (result !== undefined) {
          text = text.substring(result.length).trimStart()
          foundMatch = true
          break
        }
      }
      if (text === '') {
        break
      }
    } while (foundMatch)
  }

  handleRowColInput(text: string) {
    const matches = []

    const match1 = text.match(/^row (\w+) column (\w+)/)
    if (match1 !== null) {
      matches.push([match1[0], match1[1], match1[2]])
    }

    const match2 = text.match(/^cell (\w+) (\w+)/)
    if (match2 !== null) {
      matches.push([match2[0], match2[1], match2[2]])
    }

    for (const [match, word1, word2] of matches) {
      const row = WORDS_TO_NUMBERS[word1] - 1
      const col = WORDS_TO_NUMBERS[word2] - 1
      if (row !== undefined && col !== undefined) {
        setTimeout(voice => voice.handlers?.onSelectedCellChange?.({ row, col }, false, false, false), 0, this)
        return match
      }
    }
  }

  handleDigitInput(text: string) {
    const words = []

    const firstWord = text.split(' ')[0]
    words.push([firstWord, firstWord])

    const match = text.match(/^put (\w+)/)
    if (match !== null) {
      words.push([match[0], match[1]])
    }

    for (const [match, word] of words) {
      const digit = WORDS_TO_NUMBERS[word]
      if (digit !== undefined) {
        setTimeout(voice => voice.handlers?.onSelectedCellDigitInput?.(digit), 0, this)
        return match
      }
    }
  }

  handleDeleteInput(text: string) {
    const firstWord = text.split(' ')[0]
    if (firstWord === 'delete' || firstWord === 'remove') {
      setTimeout(voice => voice.handlers?.onSelectedCellValueChange?.(null), 0, this)
      return firstWord
    }
  }

  handleMoveInput(text: string) {
    const words = []

    const firstWord = text.split(' ')[0]
    words.push([firstWord, firstWord])

    const match = text.match(/^go (\w+)/)
    if (match !== null) {
      words.push([match[0], match[1]])
    }

    for (const [match, word] of words) {
      if (WORDS_TO_KEYS[word] !== undefined) {
        setTimeout(() => {
          window.dispatchEvent(new KeyboardEvent('keydown', {'key': WORDS_TO_KEYS[word] }))
        }, 0)
        return match
      }
    }
  }

  handleUndoInput(text: string) {
    const firstWord = text.split(' ')[0]
    if (firstWord === 'undo') {
      setTimeout(voice => voice.handlers?.onUndo?.(), 0, this)
      return firstWord
    }
  }

  handleRedoInput(text: string) {
    const firstWord = text.split(' ')[0]
    if (firstWord === 'redo') {
      setTimeout(voice => voice.handlers?.onRedo?.(), 0, this)
      return firstWord
    }
  }

  handleNumbersModeInput(text: string) {
    const firstWord = text.split(' ')[0]
    if (firstWord === 'digit' || firstWord === 'number') {
      setTimeout(voice => voice.handlers?.onNumbersActive?.(), 0, this)
      return firstWord
    }
  }

  handleCornerMarksModeInput(text: string) {
    const match = text.match(/^corner( (pencilmark|pencil mark|pencil|mark))?/)
    if (match === null) {
      return
    }

    setTimeout(voice => voice.handlers?.onCornerMarksActive?.(), 0, this)
    return match[0]
  }

  handleCenterMarksModeInput(text: string) {
    const match = text.match(/^center( (pencilmark|pencil mark|pencil|mark))?/)
    if (match === null) {
      return
    }

    setTimeout(voice => voice.handlers?.onCenterMarksActive?.(), 0, this)
    return match[0]
  }
}
