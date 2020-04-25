
import Encoder from '../Encoder'
import Chain from '../Chain'

const meta = {
  name: 'punctuation-deletion',
  title: 'Punctuation Deletion',
  category: 'Transform',
  type: 'encoder'
}

const defaultIllegals = '<>|!"£$%&/()=?^\\\';:_,.-*[]@#°'

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class PunctuationDeletionEncoder extends Encoder {
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
        name: 'illegals',
        type: 'text',
        label: "To Remove,",
        value: defaultIllegals,
        uniqueChars: true,
        minLength: 1,
        caseSensitivity: true,
        randomizable: false
      },
    ]);
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @param {integer} trialShift trial shift - optional
   * @return {number[]|string|Uint8Array|Chain} Resulting content 
   */
  performTranslate (content, isEncode) {
    let dirtyString = content.getString()
    illegals = this.getSettingValue("illegals")._string
    cleanString = ""
    for(i=0; i<dirtyString.length; i++){
      k = true
      for(j=0; j<illegals.length; j++){    
        if(dirtyString[i] == illegals[j]) k = false
      }
      if(k) cleanString += dirtyString[i]
    }
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