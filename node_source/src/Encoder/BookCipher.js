
import Encoder from '../Encoder'
import Chain from '../Chain'
import StringUtil from '../StringUtil'
import PunctuationDeletionEncoder from './PunctuationDeletion'
import SpaceDeletionEncoder from './SpaceDeletion'

const meta = {
  name: 'book-cipher',
  title: 'Book Cipher',
  category: 'Ciphers',
  type: 'encoder'
}

/**
 * Encoder brick for Book Caesar Cipher encoding and decoding
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
        label: 'Numbers (* for 1, 2, ...)',
        type: 'text',
        value: '1 11 21 31 41',
        minLength: 0,
        width: 8,
      },
      {
        name: 'countIn',
        label: 'Count In',
        type: 'enum',
        value: 'all',
        elements: ['all', 'words', 'rows'],
        labels: ['All text', 'Words', 'Rows'],
        width: 4,
      },
      {
        name: 'removeSpaces',
        label: 'Remove Spaces',
        type: 'boolean',
        value: true,
        trueLabel: "Yes",
        falseLabel: "No",
        width: 5,
      },
      {
        name: 'removeSymbols',
        label: 'Remove Punctuation',
        type: 'boolean',
        value: true,
        trueLabel: "Yes",
        falseLabel: "No",
        width: 7,
      },
      {
        name: 'toCount',
        type: 'enum',
        value: 'letters',
        elements: ['letters', 'words', 'rows'],
        labels: ['Letters', 'Words', 'Rows'],
        width: 4,
      },
      {
        name: 'toReturn',
        type: 'enum',
        value: 'letters',
        elements: ['letters', 'words'],
        labels: ['Letters', 'Words'],
        width: 4,
      },
      {
        name: 'toTake',
        type: 'enum',
        value: 'all',
        elements: ['all', 'first', 'last'],
        labels: ['All', 'First', 'Last'],
        width: 4,
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
    
    const {toReturn, toCount, toTake, separator, countIn} = this.getSettingValues()

    if(this.getSettingValue('removeSymbols')){
      PunctuationDeletionEncoderInstance = new PunctuationDeletionEncoder()
      content = new Chain(
        PunctuationDeletionEncoderInstance.performTranslate(content, true)
      )
    }

    if(this.getSettingValue('removeSpaces')){
      if(toReturn == "words") throw Error("Cannot return words after having removed spaces...")
      if(toCount == "words") throw Error("Cannot count words after having removed spaces...")

      SpaceDeletionEncoderInstance = new SpaceDeletionEncoder()
      content = new Chain(
        SpaceDeletionEncoderInstance.performTranslate(content, true)
      )
    }

    string = content.getString()
    if (countIn == "all"){
      inString = string
    }
    else if (countIn  == "words"){
      string = string.replace("\n", " ").replace(" +", " ")
      countArray = string.split(" ") // split looking for one or multiple spaces
    } else if (countIn  == "rows"){
      countArray = string.split("\n") // split looking for one or multiple spaces
    }

    let numbersString = this.getSettingValue('numbers')._string
    if(numbersString === "*"){
      if (typeof countArray !== 'undefined') 
        len = countArray.length
      else
        len = inString.length
      numbers = [...Array(len).keys()].map(x => x+1);
    }
    else{
      numbers = []
      numbersString.replace(/(\d+)/g, (match, rawNumber, offset) => {
        const alone =
          (offset === 0 || StringUtil.isWhitespace(numbersString, offset - 1)) &&
            (numbersString.length === offset + rawNumber.length ||
              StringUtil.isWhitespace(numbersString, offset + rawNumber.length))
        if (alone)
          // Ignore numbers having adjacent characters
          numbers.push(parseInt(rawNumber))
      })
    }
    console.log(numbers)
    
    outString = ""
    for (let i=0; i<numbers.length; i++) {
      if (countIn !== "all"){
        if (i>=countArray.length) break
        inString = countArray[i]
      }

      if (toCount  == "letters"){
        inArray = inString
      } else if (toCount  == "words"){
        inString = inString.replace("\n", " ").replace(" +", " ")
        inArray = inString.split(" ") // split looking for one or multiple spaces
      } else if (toCount  == "rows"){
        inArray = inString.split("\n") // split looking for one or multiple spaces
      }

      n = numbers[i] - 1
      if (n >= inArray.length) break
      else piece = inArray[n]

      toSliceIndex = {"first": 0, "last": -1}
      if (toTake !== "all"){
        if (toReturn == "letters") 
          pieceArray = piece
        else if (toReturn == "words")
          pieceArray = piece.split(" ")
        
        outString += pieceArray.slice(toSliceIndex[toTake])[0] + separator
      }
      else{
        outString += piece + separator
      }
    }
    /*
    str = content.getString()
    for (let i=0; i<str.length; i++){
      if (str[i] === "\n") {
        console.log("detected newline after "+str[i-3]+str[i-2]+str[i-1])
      }
    }
    */

    outChain = new Chain(outString)
    return outChain.getCodePoints()
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
  }

}
