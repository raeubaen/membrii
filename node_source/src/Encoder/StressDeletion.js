
import Encoder from '../Encoder'
import Chain from '../Chain'

const meta = {
  name: 'stress-deletion',
  title: 'Stress Deletion',
  category: 'Transform',
  type: 'encoder'
}

const mapToReplace = {
  è: "e",
  é: "e",
  à: "a",
  á: "a",
  ò: "o",
  ó: "o",
  í: "i",
  ì: "i",
  ù: "u",
  ú: "u",
  Á: "A",
  À: "A",
  È: "E",
  É: "E",
  Í: "I",
  Ì: "I",
  Ò: "O",
  Ó: "O",
  Ú: "U",
  Ù: "U"
}

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class StressDeletionEncoder extends Encoder {
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
    let cleanString = string.replace(/è|é|à|á|ò|ó|í|ì|ù|ú|Á|À|È|É|Í|Ì|Ò|Ó|Ú|Ù/g, function(matched){
      return mapToReplace[matched];
    });
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
