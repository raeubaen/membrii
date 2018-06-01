
import ByteEncoder from '../../ByteEncoder'
import SettingView from '../Setting'
import StringUtil from '../../StringUtil'
import View from '../../View'

/**
 * Byte setting view
 */
export default class ByteSettingView extends SettingView {
  /**
   * Constructor
   */
  constructor () {
    super()
    this._$input = null
  }

  /**
   * Retrieves value from model and updates it in view.
   * @return {SettingView} Fluent interface
   */
  updateValue () {
    const bytes = this.getModel().getValue()
    let string = ByteEncoder.hexStringFromBytes(bytes)
    string = StringUtil.chunk(string, 2).join(' ')
    this._$input.value = string
    return this
  }

  /**
   * Renders view.
   * @protected
   * @return {HTMLElement}
   */
  render () {
    const $root = super.render()
    $root.classList.add('setting-byte')
    return $root
  }

  /**
   * Renders field.
   * @protected
   * @return {?HTMLElement}
   */
  renderField () {
    this._$input = View.createElement('input', {
      className: 'setting-byte__input',
      id: this.getId(),
      type: 'text',
      spellcheck: false,
      onInput: this.inputValueDidChange.bind(this),
      onFocus: evt => this.focus(),
      onBlur: evt => this.blur()
    })

    const $field = super.renderField()
    $field.classList.remove('setting__field')
    $field.classList.add('setting-byte__field')
    $field.appendChild(this._$input)
    return $field
  }

  /**
   * Triggered when input value has been changed.
   * @param {Event} evt
   */
  inputValueDidChange (evt) {
    const string = StringUtil.removeWhitespaces(this._$input.value)

    // verify hexadecimal format
    if (string.match(/^[0-9a-f]+$/gi) === null) {
      return this.setMessage(`The value contains non-hexadecimal characters`)
    }

    // clear message
    this.clearMessage()

    // interpret bytes
    const bytes = ByteEncoder.bytesFromHexString(string)
    this.getModel().viewValueDidChange(this, bytes)
  }
}
