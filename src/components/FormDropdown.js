import React, {useCallback} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import {useTheme} from '../theme';
import {dialogInputStyles, inputStyles} from '../styles';

// zIndex pairs copied from the original call sites: the open dropdown must sit
// above its siblings, and the closed one below.
const Z_OPEN = 3000;
const Z_CLOSED_FORM = 2000;
const Z_CLOSED_DIALOG = 1000;

/**
 * DropDownPicker wrapper that derives every repeated prop from the theme.
 *
 * Replaces ~18 lines of identical props at each of the 12 call sites:
 *
 *   <FormDropdown
 *     open={categoryOpen} onOpenChange={setCategoryOpen}
 *     value={categoryValue} onChange={setCategoryValue}
 *     items={categoryData} setItems={setCategoryData}
 *     placeholder="Select Category"
 *   />
 *
 * `palette` is optional — it defaults to the form palette from ThemeContext.
 * Both the form palette (`fieldBorder`/`fieldBackground`) and the list palettes
 * (`cardBorder`/`pickerBackground`) are accepted.
 */
const FormDropdown = ({
  open,
  onOpenChange,
  value,
  onChange,
  items,
  setItems,
  placeholder,
  palette,
  variant = 'form',
  /** Called after this dropdown opens — used to close a sibling dropdown. */
  onOpened,
  listMode = 'SCROLLVIEW',
  zClosed,
  style,
  dropDownContainerStyle,
  textStyle,
  disabled,
  /** Explicit overrides — used by screens whose palette lacks field keys. */
  backgroundColor: backgroundOverride,
  borderColor: borderOverride,
  ...rest
}) => {
  const {theme, palette: themePalette} = useTheme();
  const colors = palette || themePalette.form;
  const set = variant === 'form' ? inputStyles : dialogInputStyles;

  const borderColor =
    borderOverride || colors.fieldBorder || colors.cardBorder || colors.searchBorder;
  const backgroundColor =
    backgroundOverride ||
    colors.fieldBackground ||
    colors.pickerBackground ||
    colors.searchBackground;
  const textColor = colors.textPrimary;

  const handleOpenChange = useCallback(
    isOpen => {
      onOpenChange(isOpen);
      if (isOpen && onOpened) {
        onOpened();
      }
    },
    [onOpenChange, onOpened],
  );

  const closedZ = zClosed ?? (variant === 'form' ? Z_CLOSED_FORM : Z_CLOSED_DIALOG);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={handleOpenChange}
      setValue={onChange}
      setItems={setItems}
      placeholder={placeholder}
      listMode={listMode}
      disabled={disabled}
      style={[set.picker, style, {borderColor, backgroundColor}]}
      dropDownContainerStyle={[
        set.dropdownList,
        dropDownContainerStyle,
        {borderColor, backgroundColor},
      ]}
      textStyle={[set.dropdownText, textStyle, {color: textColor}]}
      arrowColor={textColor}
      listArrowColor={textColor}
      zIndex={open ? Z_OPEN : closedZ}
      zIndexInverse={open ? closedZ : Z_OPEN}
      theme={theme === 'dark' ? 'DARK' : 'LIGHT'}
      {...rest}
    />
  );
};

export default FormDropdown;
