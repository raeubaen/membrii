
import Encoder from '../Encoder'
import MathUtil from '../MathUtil'
import {bestShiftCrack} from './CaesarBreaker'

const crackSetting = {
  name: 'crackSetting',
  label: 'Crack',
  type: 'enum',
  value: 'no',
  elements: ['no', 'english', 'italian'],
  labels: ['No', 'from english', 'from italian'],
  width: 8,
  randomizable: false
}

const meta = {
  name: 'caesar-cipher',
  title: 'Caesar cipher',
  category: 'Ciphers',
  type: 'encoder'
}

const englishAlphabet = 'abcdefghijklmnopqrstuvwxyz'
const italianAlphabet = 'abcdefghilmnopqrstuvz'
const defaultShift = 7

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class CaesarCipherEncoder extends Encoder {
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
        {
          name: 'caseStrategy',
          type: 'enum',
          value: 'maintain',
          elements: ['maintain', 'ignore', 'strict'],
          labels: ['Maintain case', 'Ignore case', 'Strict (A ≠ a)'],
          width: 6,
          randomizable: false
        },
        {
          name: 'includeForeignChars',
          type: 'boolean',
          label: 'Foreign Chars',
          width: 6,
          value: true,
          trueLabel: 'Include',
          falseLabel: 'Ignore',
          randomizable: false
        }
      ].concat(crackSetting)
    )
  }


  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @param {integer} trialShift trial shift - optional
   * @return {number[]|string|Uint8Array|Chain} Resulting content
   */
  _performTranslate (content, isEncode, trialShift) {
    const {caseStrategy, includeForeignChars} = this.getSettingValues()
    // Prepare alphabet(s) depending on chosen case strategy
    let alphabet = this.getSettingValue('alphabet')
    let uppercaseAlphabet
    if (caseStrategy !== 'strict') {
      alphabet = alphabet.toLowerCase()
      uppercaseAlphabet = alphabet.toUpperCase()
    }
    var shift;
    if (trialShift == undefined) {
      shift = this.getSettingValue('shift')
    }
    else {
      shift = trialShift
    }
    const m = alphabet.getLength()
    const n = content.getLength()
    const result = new Array(n)

    let codePoint, x, y, uppercase
    let j = 0

    // Go through each character in content
    for (let i = 0; i < n; i++) {
      codePoint = content.getCodePointAt(i)

      // Match alphabet character
      x = alphabet.indexOfCodePoint(codePoint)
      uppercase = false

      // Match uppercase alphabet character (depending on case strategy)
      if (x === -1 && caseStrategy !== 'strict') {
        x = uppercaseAlphabet.indexOfCodePoint(codePoint)
        uppercase = true
      }

      if (x === -1) {
        // Character is not in the alphabet
        if (includeForeignChars) {
          result[j++] = codePoint
        }
      } else {
        // Shift character
        y = MathUtil.mod(x + shift * (isEncode ? 1 : -1), m)

        // Translate index to character following the case strategy
        if (caseStrategy === 'maintain' && uppercase) {
          result[j++] = uppercaseAlphabet.getCodePointAt(y)
        } else {
          result[j++] = alphabet.getCodePointAt(y)
        }
      }
    }
    return result.slice(0, j)
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain} Resulting content
   */
  performTranslate (content, isEncode) {

    let crackSettingFromThis = this.getSetting(crackSetting["name"])
    if (!isEncode & (crackSettingFromThis == null)) {
      this.addSetting(crackSetting)
    }
    else if (isEncode & (crackSettingFromThis !== null)) {
      this.removeSetting(crackSettingFromThis)
    }

    if (!isEncode) {
      let crackSettingValue = this.getSettingValue(crackSetting["name"])
      if (crackSettingValue != "no") {
        let crackLanguage = crackSettingValue
        let trialsDict = {}
        let alphabet = this.getSettingValue('alphabet')._string
        for (var i=0; i<alphabet.length; i++) {
          trialsDict[i] = this._performTranslate(content, isEncode, i).slice(0, 40)
        }
        bestShift = bestShiftCrack(trialsDict, crackLanguage, alphabet);
        this.setSettingValue('shift', bestShift)
      }
    }
    else if (typeof(document) !== 'undefined') {
      document.getElementById("crack-results").innerHTML = ""
      let arrow = document.getElementById("bouncing-arrow")
      if (arrow !== null)
        arrow.style.visibility = "hidden"
    }
    return this._performTranslate(content, isEncode)
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'caseStrategy':
        // Apply case sensitivity on the alphabet setting
        this.getSetting('alphabet').setCaseSensitivity(value === 'strict')
        break
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
      case crackSetting["name"]:
        if (value != "no") {
          let arrow = document.getElementById("bouncing-arrow")
          if (arrow == undefined) {
            let pipe__scrollable = document.getElementsByClassName("pipe__scrollable")[0]
            arrow = document.createElement("div")
            arrow.classList.add("arrow", "bounce")
            arrow.id = "bouncing-arrow"
	          arrow.style.visibility = "visible"
            pipe__scrollable.appendChild(arrow)
          }
          else {
            arrow.style.visibility = "visible"
          }
        }
        else {
          document.getElementById("crack-results").innerHTML = ""
          let arrow = document.getElementById("bouncing-arrow")
          if (arrow !== null)
            arrow.style.visibility = "hidden"
        }
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
    const encoded = alphabet.getCharAt(index)
    return `${plain}→${encoded}`
  }
}
