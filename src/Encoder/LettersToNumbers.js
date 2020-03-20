
import Encoder from '../Encoder'
import MathUtil from '../MathUtil'
import Chain from '../Chain'
import StringUtil from '../StringUtil'

const meta = {
  name: 'letters-to-numbers',
  title: 'Letters to numbers',
  category: 'Encoding',
  type: 'encoder'
}

const englishAlphabet = 'abcdefghijklmnopqrstuvwxyz'
const italianAlphabet = 'abcdefghilmnopqrstuvz'
const defaultShift = 1   

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class LettersToNumbersEncoder extends Encoder {
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
    this.addSettings(
      [
        {
          name: 'shift',
          type: 'number',
          label: 'Shift',
          priority: 10,
          value: defaultShift,
          integer: true,
          describeValue: this.describeShiftValue.bind(this),
          randomizeValue: this.randomizeShiftValue.bind(this)
        },      
        {
          name: 'language',
          label: 'Ciphertext Alphabet',
          type: 'enum',
          value: 'english',
          elements: ['english', 'italian', 'other'],
          labels: ['English', 'Italian', 'Other'],
          blackChoiceList: [],
          width: 8,
          randomizable: false
        },
        {
          name: 'alphabet',
          type: 'text',
          value: englishAlphabet,
          uniqueChars: true,
          minLength: 2,
          caseSensitivity: false,
          randomizable: false
        },
      ]
    )
  }

  /**
   * Performs encode or decode on given content.
   * @param {number[]} codeArray
   * @param {string} alphabet
   * @return {number[]|string|Uint8Array|Chain} Resulting content 
   */
  fromLettersToNumbers(codeArray, alphabet){
    let letterChain = new Chain(codeArray)
    let letterString = letterChain.toString()
    let numString = ""
    for (let i=0; i<letterChain.getLength(); i++) {
      num = alphabet.indexOf(letterString[i])
      if (num !== -1)
        numString += num.toString() + " "
    }
    let numChain = new Chain(numString)
    return numChain.getCodePoints()
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {string} alphabet
   * @return {number[]|string|Uint8Array|Chain} Resulting content 
   */
  fromNumbersToLetters(content, alphabet){
    // Find numbers using pattern
    let string = content.getString()
    const result = string.replace(/(\d+)/g, (match, rawNumber, offset) => {
      const alone =
        (offset === 0 || StringUtil.isWhitespace(string, offset - 1)) &&
        (string.length === offset + rawNumber.length ||
          StringUtil.isWhitespace(string, offset + rawNumber.length))

      if (!alone || rawNumber >= alphabet.length) {
        // Ignore numbers having adjacent characters
        return rawNumber
      }
      return alphabet.getCharAt(rawNumber)
    })
    return new Chain(result)
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @param {integer} trialShift trial shift - optional
   * @return {number[]|string|Uint8Array|Chain} Resulting content 
   */
  performTranslate (content, isEncode) {
    const {caseStrategy} = this.getSettingValues()
    // Prepare alphabet(s) depending on chosen case strategy
    let alphabet = this.getSettingValue('alphabet')
    alphabet = alphabet.toLowerCase()
    let uppercaseAlphabet = alphabet.toUpperCase()
    let shift = this.getSettingValue('shift')

    const m = alphabet.getLength()
    const n = content.getLength()
    let result = new Array(n)

    let codePoint, x, y, uppercase
    let j = 0

    if (!isEncode) { //numbers to letters
      content = this.fromNumbersToLetters(content, alphabet)
    }

    // Go through each character in content
    for (let i=0; i < n; i++) {
      codePoint = content.getCodePointAt(i)

      // Match alphabet character
      x = alphabet.indexOfCodePoint(codePoint)

      // Match uppercase alphabet character (depending on case strategy)
      if (x === -1) {
        x = uppercaseAlphabet.indexOfCodePoint(codePoint)
      }

      if (x !== -1) {
        // Shift character
        y = MathUtil.mod(x + shift * (isEncode ? 1 : -1), m)
        result[j++] = alphabet.getCodePointAt(y)
      }
    }
    result = result.slice(0, j)
    if (isEncode)
      result = this.fromLettersToNumbers(result, alphabet)
    return result
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'alphabet':
        // The shift value description depends on the alphabet and thus needs
        // to be updated when the alphabet changes
        this.getSetting('shift').setNeedsValueDescriptionUpdate();
        if (value != englishAlphabet && value != italianAlphabet){
          this.setSettingValue("language", "other")
        }
        break
      case 'language':
        if (value == "english") {
          this.setSettingValue('alphabet', englishAlphabet)
        }
        else if (value == "italian") {
          this.setSettingValue('alphabet', italianAlphabet)
        }
        this.getSetting('shift').setNeedsValueDescriptionUpdate()
        break
    }
  }

  /**
   * Generates a random shift setting value.
   * @param {Random} random Random instance
   * @param {Field} setting Shift setting
   * @return {string} Randomized plugboard setting value
   */
  randomizeShiftValue (random, setting) {
    const alphabetSetting = this.getSetting('alphabet')
    if (alphabetSetting.isValid()) {
      return random.nextInteger(1, alphabetSetting.getValue().getLength() - 1)
    }
    return null
  }

  /**
   * Function describing the given shift value in a human-readable way.
   * @param {number} value Field value
   * @param {Field} setting Sender
   * @return {?string} Shift label
   */
  describeShiftValue (value, setting) {
    // The shift value description depends on the alphabet setting
    if (!this.getSetting('alphabet').isValid()) {
      return null
    }

    // Shift the first character of the alphabet to describe the translation
    const { alphabet, shift } = this.getSettingValues()
    const plain = alphabet.getCharAt(0)
    const index = MathUtil.mod(shift, alphabet.getLength())
    const encoded = index
    return `${plain}→${encoded}`
  }
}
