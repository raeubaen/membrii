
import Encoder from '../Encoder'
import Chain from '../Chain'

const meta = {
  name: 'space-deletion',
  title: 'Space Deletion',
  category: 'Transform',
  type: 'encoder'
}

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class SpaceDeletionEncoder extends Encoder {
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
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @param {integer} trialShift trial shift - optional
   * @return {number[]|string|Uint8Array|Chain} Resulting content 
   */
  performTranslate (content, isEncode) {
    let string = content.getString()
    let cleanString = string.replace(
      / /g, 
      function(matched){
        return ""
      }
    );
    let cleanChain = new Chain(cleanString)
    return cleanChain.getCodePoints()
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
  }

}
