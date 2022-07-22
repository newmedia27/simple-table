export const MAX_INDENT_DEPTH = 20;
export const MAX_LIST_DEPTH = 4;
export const COLORS = [
  '#000000',
  '#FFFFFF',
  '#888888',
  '#AAAAAA',
  '#EEEEEE',
  '#880000',
  '#CC0000',
  '#FF0000',
  '#FFCCCC',
  '#FF8800',
  '#FFCC00',
  '#FFFF00',
  '#CCFF00',
  '#88FF00',
  '#008800',
  '#00CC00',
  '#00CC88',
  '#00CCCC',
  '#CCEEFF',
  '#00CCFF',
  '#0088FF',
  '#0000FF',
  '#8800FF',
  '#CC00CC',
  '#CC0088',
];
export const FONTS = [
  'Arial',
  'Arial Black',
  'Comic Sans MS',
  'Courier New',
  'Helvetica Neue',
  'Helvetica',
  'Impact',
  'Lucida Grande',
  'Tahoma',
  'Times New Roman',
  'Verdana',
];
export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 18, 24, 36];

export const defaultPreTagStyling = [
  ['padding', '9.5px'],
  ['margin', '0 0 10px'],
  ['border', '1px solid rgb(204, 204, 204)'],
  ['background', 'rgb(245, 245, 245)'],
];

export const availableAlignments = [
  { type: 'left', display: { icon: 'align-left-sld' } },
  { type: 'center', display: { icon: 'align-center-sld' } },
  { type: 'right', display: { icon: 'align-right-sld' } },
  { type: 'justify', display: { icon: 'align-justify-sld' } },
];

export const dropdownOptions = {
  alignment: {
    activeOption: (alignment = 'left') => availableAlignments.find(a => a.type === alignment),
    controlWidth: 40,
    dropdownWidth: 40,
    list: availableAlignments,
    method: 'listDropdown',
    className: 'Toolbar Toolbar__modal'
  },
}

export const Keys = {
  B: 66,
  Backspace: 8,
  Delete: 127,
  E: 69,
  Enter: 13,
  I: 73,
  J: 74,
  L: 76,
  R: 82,
  T: 84,
  Tab: 9,
  U: 85,
  '[': 219,
  ']': 221,
};


export const inlineStylesTypes = [
  'BOLD',
  'ITALIC',
  'UNDERLINE'
]

export const BLOCK_TYPES = [
	{ label: " “ ” ", style: "blockquote" },
	{ label: "UL", style: "unordered-list-item" },
	{ label: "OL", style: "ordered-list-item" },
	{ label: "{ }", style: "code-block" }
];

export const HEADER_TYPES = [
	// { label: "(None)", style: "unstyled" },
	{ label: "H1", style: "header-one" },
	{ label: "H2", style: "header-two" },
	// { label: "H3", style: "header-three" },
	// { label: "H4", style: "header-four" },
	// { label: "H5", style: "header-five" },
	// { label: "H6", style: "header-six" }
];
