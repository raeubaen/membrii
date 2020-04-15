
import Encoder from '../Encoder'
import Chain from '../Chain'
import StringUtil from '../StringUtil'
import StressDeletionEncoder from './StressDeletion'
const meta = {
  name: 'book-cipher',
  title: 'Book Cipher',
  category: 'Ciphers',
  type: 'encoder'
}

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class BookCipherEncoder extends Encoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  /**
   * Constructor
   */
  constructor () {
    super()
    this.addSettings([
      {
        name: 'numbers',
        type: 'text',
        value: '1 11 21 31 41',
        minLength: 0,
      },
      {
        name: 'count',
        type: 'enum',
        value: 'letters',
        elements: ['letters', 'words', 'rows'],
        labels: ['Letters', 'Words', 'Rows'],
      },
      {
        name: 'return',
        type: 'enum',
        value: 'letters',
        elements: ['letters', 'words'],
        labels: ['Letters', 'Words'],
      },
      {
        name: 'take',
        type: 'enum',
        value: 'all',
        elements: ['all', 'first', 'last'],
        labels: ['All', 'First', 'Last'],
      },
      {
        name: 'separator',
        label: 'Separated by',
        type: 'enum',
        value: ' ',
        elements: [' ', '\n', ',', ';', '/'],
        labels: ['Space', 'Newline', 'Comma', 'Semicolon', 'Slash'],
      },
   ])
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @param {integer} trialShift trial shift - optional
   * @return {number[]|string|Uint8Array|Chain} Resulting content 
   */
  performTranslate (content, isEncode) {
    //works as example; real task shall be to remove all non-alphabet characters, except newline
    StressDeletionEncoderInstance = new StressDeletionEncoder()
    content = new Chain(StressDeletionEncoderInstance.performTranslate(content, true))


    let numbersString = this.getSettingValue('numbers')._string
    let numbers = []
    numbersString.replace(/(\d+)/g, (match, rawNumber, offset) => {
      const alone =
        (offset === 0 || StringUtil.isWhitespace(numbersString, offset - 1)) &&
          (numbersString.length === offset + rawNumber.length ||
            StringUtil.isWhitespace(numbersString, offset + rawNumber.length))
      if (alone)
        // Ignore numbers having adjacent characters
        numbers.push(parseInt(rawNumber))
    })


    let codePoints = []
    for (let i=0; i<numbers.length; i++) {
      if ((numbers[i]-1)<content.getLength())
      codePoints.push(content.getCodePointAt(numbers[i]-1))
    }
    /*
    str = content.getString()
    for (let i=0; i<str.length; i++){
      if (str[i] === "\n") {
        console.log("detected newline after "+str[i-3]+str[i-2]+str[i-1])
      }
    }
    */
    return codePoints
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
  }

}