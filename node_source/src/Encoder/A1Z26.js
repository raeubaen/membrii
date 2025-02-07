
import CharacterBlockEncoder from './CharacterBlock'

const meta = {
  name: 'a1z26',
  title: 'A1Z26',
  category: 'Ciphers',
  type: 'encoder'
}


const englishAlphabet = 'abcdefghijklmnopqrstuvwxyz'
const italianAlphabet = 'abcdefghilmnopqrstuvz'
/**
 * Encoder brick for the letter number cipher (A1Z26) encoding and decoding
 */
export default class A1Z26Encoder extends CharacterBlockEncoder {
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
        name: 'language',
        type: 'enum',
        value: 'english',
        elements: ['english', 'italian', 'other'],
        labels: ['English', 'Italian', 'Other'],
        width: 6,
        randomizable: false
      },
      {
        name: 'alphabet',
        type: 'text',
        value: 'abcdefghijklmnopqrstuvwxyz',
        uniqueChars: true,
        minLength: 2
      },
      {
        name: 'caseSensitivity',
        type: 'boolean',
        value: false,
        randomizable: false
      }
    ])
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
        if (value != englishAlphabet && value != italianAlphabet){
          this.getSetting("language").setValue("other")
        }
        break
      case 'language':
        if (value == "english") {
          this.getSetting('alphabet').setValue(englishAlphabet)
        }
        else if (value == "italian") {
          console.log("italian");
          this.getSetting('alphabet').setValue(italianAlphabet)
        }
        break
    }
  }

  /**
   * Triggered before performing encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Filtered content
   */
  willEncode (content) {
    const caseSensitivity = this.getSettingValue('caseSensitivity')
    if (caseSensitivity) {
      return content
    } else {
      return content.toLowerCase()
    }
  }

  /**
   * Encodes given character to a block.
   * @protected
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index
   * @param {Chain} content Content to be encoded
   * @return {number[]|string|Uint8Array|Chain|null} Encoded block
   */
  performCharEncodeToBlock (codePoint, index, content) {
    const caseSensitivity = this.getSettingValue('caseSensitivity')

    let alphabet = this.getSettingValue('alphabet')
    if (!caseSensitivity) {
      alphabet = alphabet.toLowerCase()
    }

    let charIndex = alphabet.indexOfCodePoint(codePoint)
    if (charIndex === -1) {
      return null
    }

    // This is a 1-based index
    charIndex += 1

    return charIndex.toString()
  }

  /**
   * Decodes given block to a character.
   * @protected
   * @param {number} block Block
   * @param {number} index Block index
   * @param {Chain[]} blocks Blocks to be decoded
   * @param {Chain} content Content to be decoded
   * @return {number|null} Decoded code point
   */
  performBlockDecodeToChar (block, index, blocks, content) {
    const caseSensitivity = this.getSettingValue('caseSensitivity')

    let alphabet = this.getSettingValue('alphabet')
    if (!caseSensitivity) {
      alphabet = alphabet.toLowerCase()
    }

    const charIndex = parseInt(block)
    if (isNaN(charIndex) || charIndex < 1 || charIndex > alphabet.getLength()) {
      return null
    }

    const codePoint = alphabet.getCodePointAt(charIndex - 1)
    return codePoint
  }
}
