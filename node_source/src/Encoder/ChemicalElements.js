
import Encoder from '../Encoder'
import MathUtil from '../MathUtil'
import Chain from '../Chain'
import StringUtil from '../StringUtil'

const meta = {
  name: 'chemical-elements',
  title: 'Chemical elements',
  category: 'Encoding',
  type: 'encoder'
}

const symbols = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og']

const englishNames = ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon', 'Sodium', 'Magnesium', 'Aluminium', 'Silicon', 'Phosphorus', 'Sulfur', 'Chlorine', 'Argon', 'Potassium', 'Calcium', 'Scandium', 'Titanium', 'Vanadium', 'Chromium', 'Manganese', 'Iron', 'Cobalt', 'Nickel', 'Copper', 'Zinc', 'Gallium', 'Germanium', 'Arsenic', 'Selenium', 'Bromine', 'Krypton', 'Rubidium', 'Strontium', 'Yttrium', 'Zirconium', 'Niobium', 'Molybdenum', 'Technetium', 'Ruthenium', 'Rhodium', 'Palladium', 'Silver', 'Cadmium', 'Indium', 'Tin', 'Antimony', 'Tellurium', 'Iodine', 'Xenon', 'Caesium', 'Barium', 'Lanthanum', 'Cerium', 'Praseodymium', 'Neodymium', 'Promethium', 'Samarium', 'Europium', 'Gadolinium', 'Terbium', 'Dysprosium', 'Holmium', 'Erbium', 'Thulium', 'Ytterbium', 'Lutetium', 'Hafnium', 'Tantalum', 'Tungsten', 'Rhenium', 'Osmium', 'Iridium', 'Platinum', 'Gold', 'Mercury', 'Thallium', 'Lead', 'Bismuth', 'Polonium', 'Astatine', 'Radon', 'Francium', 'Radium', 'Actinium', 'Thorium', 'Protactinium', 'Uranium', 'Neptunium', 'Plutonium', 'Americium', 'Curium', 'Berkelium', 'Californium', 'Einsteinium', 'Fermium', 'Mendelevium', 'Nobelium', 'Lawrencium', 'Rutherfordium', 'Dubnium', 'Seaborgium', 'Bohrium', 'Hassium', 'Meitnerium', 'Darmstadtium', 'Roentgenium', 'Copernicium', 'Nihonium', 'Flerovium', 'Moscovium', 'Livermorium', 'Tennessine', 'Oganesson']

const italianNames = ['Idrogeno', 'Elio', 'Litio', 'Berillio', 'Boro', 'Carbonio', 'Azoto', 'Ossigeno', 'Fluoro', 'Neon', 'Sodio', 'Magnesio', 'Alluminio', 'Silicio', 'Fosforo', 'Zolfo', 'Cloro', 'Argon', 'Potassio', 'Calcio', 'Scandio', 'Titanio', 'Vanadio', 'Cromo', 'Manganese', 'Ferro', 'Cobalto', 'Nichel', 'Rame', 'Zinco', 'Gallio', 'Germanio', 'Arsenico', 'Selenio', 'Bromo', 'Kripton', 'Rubidio', 'Stronzio', 'Ittrio', 'Zirconio', 'Niobio', 'Molibdeno', 'Tecnezio', 'Rutenio', 'Rodio', 'Palladio', 'Argento', 'Cadmio', 'Indio', 'Stagno', 'Antimonio', 'Tellurio', 'Iodio', 'Xeno', 'Cesio', 'Bario', 'Lantanio', 'Cerio', 'Praseodimio', 'Neodimio', 'Promezio', 'Samario', 'Europio', 'Gadolinio', 'Terbio', 'Disprosio', 'Olmio', 'Erbio', 'Tulio', 'Itterbio', 'Lutezio', 'Afnio', 'Tantalio', 'Tungsteno', 'Renio', 'Osmio', 'Iridio', 'Platino', 'Oro', 'Mercurio', 'Tallio', 'Piombo', 'Bismuto', 'Polonio', 'Astato', 'Radon', 'Francio', 'Radio', 'Attinio', 'Torio', 'Protoattinio', 'Uranio', 'Nettunio', 'Plutonio', 'Americio', 'Curio', 'Berkelio', 'Californio', 'Einsteinio', 'Fermio', 'Mendelevio', 'Nobelio', 'Laurenzio', 'Rutherfordio', 'Dubnio', 'Seaborgio', 'Bohrio', 'Hassio', 'Meitnerio', 'Darmstadtio', 'Roentgenio', 'Copernicio', 'Nihonio', 'Flerovio', 'Moscovio', 'Livermorio', 'Tennesso', 'Oganesson']


/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class ChemicalElementsEncoder extends Encoder {
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
          name: 'toReturn',
          label: 'return',
          type: 'enum',
          value: 'symbols',
          elements: ['symbols', 'englishNames', 'italianNames'],
          labels: ['Symbols', 'English names', 'Italian names'],
          width: 8,
          randomizable: false
        },
        {
          name: 'separator',
          label: 'separator',
          type: 'enum',
          value: '',
          elements: ['', ' ', ',', '/'],
          labels: ['Nothing', 'Space', 'Comma', 'Slash'],
          width: 8,
          randomizable: false
        },

      ]
    )
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @param {integer} trialShift trial shift - optional
   * @return {number[]|string|Uint8Array|Chain} Resulting content 
   */
  performTranslate (content, isEncode) {
    contentString = content.getString()
    numbers = []

    outString = ""
    const {toReturn, separator} = this.getSettingValues()

    contentString.replace(/(\d+|[a-zA-Z]+)/g, (match) => {
      match.replace(/\d+/g, (numberLiteral) => {
        // Ignore numbers having adjacent characters
        number = parseInt(numberLiteral)
        if (number != 0){
          if (toReturn==="symbols"){
            chemElement = symbols[number-1]
          }
          else if (toReturn==="englishNames"){
            chemElement = englishNames[number-1]
          }
          else if (toReturn==="italianNames"){
            chemElement = italianNames[number-1]
          }
          outString += chemElement + separator
        }
      })
      match.replace(/[a-zA-Z]+/g, (letters) => {
          outString += letters + separator
      })
    })

    outChain = new Chain(outString)
    return outChain.getCodePoints()
  }

}
