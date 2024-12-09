// Copied a lot of code from https://github.com/ccoreilly/vosk-browser/tree/master/examples/react/src
import { type KaldiRecognizer, Model, createModel } from 'vosk-browser'
import { DuplexOptions, Writable, Duplex } from 'readable-stream'
import MicrophoneStream from 'microphone-stream'

import { GRAMMAR, MODEL_URL, WORDS_TO_KEYS, WORDS_TO_NUMBERS } from './constants'
import type { SudokuEventCallbacks } from 'src/utils/keyboard'

// Need to polyfill because microphone-stream uses it
if (process.nextTick === undefined) {
  process.nextTick = (callback, ...args) => {
    setTimeout(() => callback(...args), 0)
  }
}

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
  onWordsInput?: (words: string) => void;
  onSelectedCellChange?: SudokuEventCallbacks['onSelectedCellChange']
  onSelectedCellValueChange?: SudokuEventCallbacks['onSelectedCellValueChange']
}

export class Voice {
  constructor(private handlers?: VoiceHandlers) {
    this.audioBucket = new Writable({
      write(_chunk, _encoding, callback) {
        callback()
      },
      objectMode: true,
      decodeStrings: false,
    })
  }

  private model?: Model
  private micStream?: MicrophoneStream
  private audioBucket: Writable
  private audioStreamer?: AudioStreamer

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
    // TODO: use partial results
    // recognizer.on("partialresult", (message: any) => {
    //   // console.log('partialresult', message.result.partial)
    //   // setPartial(message.result.partial)
    // })

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

    // Note: do not call this.start() here, as double calling start() causes bugs
  }

  public start() {
    console.warn('CALLING START()')
    this.micStream?.unpipe(this.audioBucket)
    this.micStream?.pipe(this.audioStreamer!)
    console.log('Listening...')
    this.handlers?.onWordsInput?.('Listening...')
  }

  public pause() {
    console.warn('CALLING PAUSE()')
    this.micStream?.unpipe(this.audioStreamer!)
    this.micStream?.pipe(this.audioBucket)
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
    console.log('result', result)
    const txt = result.text

    this.handlers?.onWordsInput?.(txt)

    this.handleRowColInput(txt)
    this.handleDigitInput(txt)
    this.handleMoveInput(txt)
  }

  handleRowColInput(txt: string) {
    const match = txt.match(/row (\w+) column (\w+)/)
    if (match) {
      const row = WORDS_TO_NUMBERS[match[1]] - 1
      const col = WORDS_TO_NUMBERS[match[2]] - 1
      if (row !== undefined && col !== undefined) {
        console.warn(`Selected cell ${row},${col}`)
        this.handlers?.onSelectedCellChange?.({ row, col }, false, false, false)
      }
    }
  }

  // TODO: maybe also "write five" or "put in five"
  handleDigitInput(txt: string) {
    const match = txt.match(/digit (\w+)/)
    if (match) {
      console.log('matched digit regex', match[1])
      const digit = WORDS_TO_NUMBERS[match[1]]
      if (digit !== undefined) {
        console.warn(`Wrote digit ${digit}`)
        this.handlers?.onSelectedCellValueChange?.(digit)
      }
    }
  }

  // TODO: maybe also "go up"
  handleMoveInput(txt: string) {
    if (WORDS_TO_KEYS[txt] !== undefined) {
      window.dispatchEvent(new KeyboardEvent('keydown', {'key': WORDS_TO_KEYS[txt] }))
    }
  }
}
