
import MathUtil from '../MathUtil'
import Encoder from '../Encoder'

const meta = {
  name: 'affine-cipher',
  title: 'Affine cipher',
  category: 'Ciphers',
  type: 'encoder'
}

const defaultAlphabet = 'abcdefghijklmnopqrstuvwxyz'

/**
 * Encoder brick for Affine Cipher encoding and decoding
 */
export default class AffineCipherEncoder extends Encoder {
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

    // Linear function
    // f(x) = ax + b

    this.addSettings([
      {
        name: 'a',
        type: 'number',
        label: 'Slope / a',
        width: 6,
        value: 5,
        validateValue: this.validateSlopeValue.bind(this),
        randomizeValue: this.randomizeSlopeValue.bind(this),
        options: {
          integer: true,
          min: 1
        }
      },
      {
        name: 'b',
        type: 'number',
        label: 'Intercept / b',
        width: 6,
        value: 8,
        randomizeValue: this.randomizeInterceptValue.bind(this),
        options: {
          integer: true,
          min: 1
        }
      },
      {
        name: 'alphabet',
        type: 'alphabet',
        value: defaultAlphabet,
        randomizable: false
      },
      {
        name: 'caseSensitivity',
        type: 'boolean',
        width: 6,
        value: false,
        randomizable: false
      },
      {
        name: 'includeForeignChars',
        type: 'boolean',
        label: 'Foreign Chars',
        width: 6,
        value: true,
        randomizable: false,
        options: {
          trueLabel: 'Include',
          falseLabel: 'Ignore'
        }
      }
    ])
  }

  /**
   * Triggered before performing encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Filtered content
   */
  willTranslate (content, isEncode) {
    return !this.getSettingValue('caseSensitivity')
      ? content.toLowerCase()
      : content
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    const { a, b, alphabet, includeForeignChars } = this.getSettingValues()

    const m = alphabet.getLength()
    const n = content.getLength()
    const result = new Array(n).fill(0)

    let codePoint, i, c, x, y
    for (i = 0; i < n; i++) {
      codePoint = content.getCodePointAt(i)

      x = alphabet.indexOfCodePoint(codePoint)
      if (x === -1) {
        // Character not in alphabet
        if (includeForeignChars) {
          // Take over character unchanged
          result[i] = codePoint
        }
      } else {
        if (isEncode) {
          // E(x) = (ax + b) mod m
          y = MathUtil.mod(a * x + b, m)
        } else {
          // D(x) = (a^-1(x - b)) mod m
          c = MathUtil.xgcd(a, m)[0]
          y = MathUtil.mod(c * (x - b), m)
        }
        result[i] = alphabet.getCodePointAt(y)
      }
    }

    return result
  }

  /**
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'alphabet':
        // Changing the alphabet setting value can invalidate the slope setting
        this.getSetting('a').revalidateValue()
        break
      case 'caseSensitivity':
        // Also set case sensitivity on the alphabet setting
        this.getSetting('alphabet').setCaseSensitivity(value)
        break
    }
    super.settingValueDidChange(setting, value)
  }

  /**
   * Validates slope (a) setting value.
   * @param {number} a
   * @return {boolean|object}
   */
  validateSlopeValue (a) {
    const alphabetSetting = this.getSetting('alphabet')
    if (!alphabetSetting.isValid()) {
      // Can't validate slope without valid alphabet setting
      return false
    }

    // The value a must be chosen such that a and m are coprime
    const m = alphabetSetting.getValue().getLength()
    if (!MathUtil.isCoprime(a, m)) {
      return {
        key: 'affineCipherFunctionInvalid',
        message:
          `The value must be chosen such that it is coprime to the size ` +
          `of the alphabet (${m})`
      }
    }

    return true
  }

  /**
   * Generates a random slope setting value.
   * @protected
   * @param {Random} random Random instance
   * @param {Setting} setting Setting instance
   * @return {string} Random slope setting value
   */
  randomizeSlopeValue (random, setting) {
    const alphabetSetting = this.getSetting('alphabet')
    if (alphabetSetting.isValid()) {
      const alphabet = alphabetSetting.getValue()
      const m = alphabet.getLength()

      // Create range based on alphabet and filter coprime values
      // Don't use caesar cipher slope (a=1) if possible
      const range = alphabet.getCodePoints().map((_, i) => i + 1)
      const coprimes = range.filter(a => a > 1 && MathUtil.isCoprime(a, m))
      return coprimes.length > 0 ? random.nextChoice(coprimes) : 1
    }
    return null
  }

  /**
   * Generates a random intercept setting value.
   * @protected
   * @param {Random} random Random instance
   * @param {Setting} setting Setting instance
   * @return {string} Random intercept setting value
   */
  randomizeInterceptValue (random, setting) {
    const alphabetSetting = this.getSetting('alphabet')
    if (alphabetSetting.isValid()) {
      const m = this.getSetting('alphabet').getValue().getLength()
      return random.nextInteger(1, m - 1)
    }
    return null
  }
}
