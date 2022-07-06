'use strict';

Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });

const React = require('react');
const draftJs = require('draft-js');
const lodash = require('lodash');
const immutable = require('immutable');
require('draft-js/lib/RichTextEditorUtil');
const draftjsConductor = require('draftjs-conductor');
const reactDom = require('react-dom');
const PropTypes = require('prop-types');
const ClassNames = require('classnames');
const jsxRuntime = require('react/jsx-runtime');
const Editor = require('@draft-js-plugins/editor');
const draftjsUtils = require('draftjs-utils');
require('draft-js/dist/Draft.css');
const reactFontawesome = require('@fortawesome/react-fontawesome');
const useClickOutside = require('use-onclickoutside');
const draftJsExportHtml = require('draft-js-export-html');
const parser = require('html-react-parser');
const freeSolidSvgIcons = require('@fortawesome/free-solid-svg-icons');
const fontawesomeSvgCore = require('@fortawesome/fontawesome-svg-core');
require('@fortawesome/fontawesome-svg-core/styles.css');

const MAX_LIST_DEPTH = 4;
const COLORS = ['#000000', '#FFFFFF', '#888888', '#AAAAAA', '#EEEEEE', '#880000', '#CC0000', '#FF0000', '#FFCCCC', '#FF8800', '#FFCC00', '#FFFF00', '#CCFF00', '#88FF00', '#008800', '#00CC00', '#00CC88', '#00CCCC', '#CCEEFF', '#00CCFF', '#0088FF', '#0000FF', '#8800FF', '#CC00CC', '#CC0088'];
const FONTS = ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Helvetica Neue', 'Helvetica', 'Impact', 'Lucida Grande', 'Tahoma', 'Times New Roman', 'Verdana'];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 18, 24, 36];
const defaultPreTagStyling = [['padding', '9.5px'], ['margin', '0 0 10px'], ['border', '1px solid rgb(204, 204, 204)'], ['background', 'rgb(245, 245, 245)']];
const availableAlignments = [{
  type: 'left',
  display: {
    icon: 'align-left-sld'
  }
}, {
  type: 'center',
  display: {
    icon: 'align-center-sld'
  }
}, {
  type: 'right',
  display: {
    icon: 'align-right-sld'
  }
}, {
  type: 'justify',
  display: {
    icon: 'align-justify-sld'
  }
}];
const dropdownOptions = {
  alignment: {
    activeOption: (alignment = 'left') => availableAlignments.find(a => a.type === alignment),
    controlWidth: 40,
    dropdownWidth: 40,
    list: availableAlignments,
    method: 'listDropdown'
  }
};
const Keys = {
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
  ']': 221
};
const inlineStylesTypes = ['BOLD', 'ITALIC', 'UNDERLINE'];
const BLOCK_TYPES = [{
  label: " “ ” ",
  style: "blockquote"
}, {
  label: "UL",
  style: "unordered-list-item"
}, {
  label: "OL",
  style: "ordered-list-item"
}, {
  label: "{ }",
  style: "code-block"
}];
const HEADER_TYPES = [{
  label: "H1",
  style: "header-one"
}, {
  label: "H2",
  style: "header-two"
}];

const handleTabInTable = (direction = "next", collapsed = false, editorState, onChange = () => {}) => {
  let newEditorState = editorState;
  let selection = editorState.getSelection();
  let contentState = editorState.getCurrentContent();
  let targetKey = selection.getAnchorKey();
  let targetBlock = contentState.getBlockForKey(targetKey);

  do {
    if (direction === "next") {
      targetBlock = contentState.getBlockAfter(targetKey);
    } else {
      targetBlock = contentState.getBlockBefore(targetKey);
    }

    targetKey = targetBlock && targetBlock.getKey();
  } while (targetKey && ["atomic", "horizontal-rule"].includes(targetBlock.getType()));

  if (!targetBlock && direction === "next") {
    selection = selection.merge({
      anchorOffset: contentState.getBlockForKey(selection.getAnchorKey()).getLength(),
      focusOffset: contentState.getBlockForKey(selection.getAnchorKey()).getLength()
    });
    contentState = draftJs.Modifier.splitBlock(contentState, selection);
    targetBlock = contentState.getLastBlock();
    selection = draftJs.SelectionState.createEmpty(targetBlock.getKey());
    contentState = draftJs.Modifier.setBlockType(contentState, selection, "unstyled");
    targetBlock = contentState.getLastBlock();
    newEditorState = draftJs.EditorState.push(editorState, contentState, "split-block");
  } else if (!targetBlock) {
    targetBlock = contentState.getBlockForKey(selection.getAnchorKey());
  }

  const isTargetTable = targetBlock.getData()?.get("dataType") === "table-cel" && !collapsed;
  const endOffset = targetBlock.getLength();
  selection = draftJs.SelectionState.createEmpty(targetBlock.getKey());
  selection = selection.merge({
    anchorOffset: isTargetTable || direction === "next" ? 0 : endOffset,
    focusOffset: isTargetTable || direction === "previous" ? endOffset : 0
  });
  onChange(draftJs.EditorState.forceSelection(newEditorState, selection));
};

function CreateTableComponent(props) {
  function createTable() {
    const {
      blockProps,
      contentState
    } = props;
    const {
      blocks
    } = draftJs.convertToRaw(contentState);
    const index = blocks.findIndex(e => e?.data?.dataType === "table-create");
    const {
      onChange
    } = blockProps.getProps();
    const createrBlock = blocks[index];
    const {
      data
    } = createrBlock;
    const {
      rows,
      cols,
      tableKey,
      aligment
    } = data;
    const colArr = Array(cols).fill(1).map(e => ({
      key: draftJs.genKey()
    }));
    const rowArr = Array(rows).fill(colArr);
    const newBlocks = [];
    let dataMap = immutable.Map({
      tableKey,
      aligment,
      dataType: "table-cel"
    });
    dataMap = dataMap.set("defaultSchema", rowArr);
    newBlocks.push(new draftJs.ContentBlock({
      key: draftJs.genKey(),
      type: "table",
      text: " ",
      data: dataMap
    }));
    const prepareBlocks = [...contentState.getBlocksAsArray()];
    prepareBlocks.splice(index, 1, ...newBlocks);
    const entityMap = contentState.getEntityMap();
    const newState = draftJs.ContentState.createFromBlockArray(prepareBlocks, entityMap);
    const editorState = draftjsConductor.createEditorStateFromRaw(draftJs.convertToRaw(newState));
    onChange(editorState);
  }

  React.useEffect(() => {
    createTable();
  }, []);
  return null;
}

const styles = {"modal__wrapper":"modal-module_modal__wrapper__Pu4Ik","open":"modal-module_open__qDVgF","modal__wrapper_closed":"modal-module_modal__wrapper_closed__LQ3tF","closed":"modal-module_closed__QRp3X","modal__overlay":"modal-module_modal__overlay__NR1YT","start":"modal-module_start__C6xiQ","modal__overlay_closed":"modal-module_modal__overlay_closed__l-kGz","finish":"modal-module_finish__s8bab","root":"modal-module_root__8rQfW","modalRoot":"modal-module_modalRoot__oC3rk"};

let modalRoot;

if (typeof document === "object") {
  modalRoot = document.createElement("div");
  modalRoot.setAttribute("class", styles.modalRoot);
  document.body.appendChild(modalRoot);
}

const ModalContent = ({
  children,
  closingAnimate,
  className
}) => {
  const {
    isOpen,
    close,
    disabled
  } = useModal();
  React.useEffect(() => {
    const handleKeyUp = e => {
      if (e.which === 27) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keyup", handleKeyUp, false);
    return () => {
      window.removeEventListener("keyup", handleKeyUp, false);
    };
  }, [close]);
  if (!isOpen) return null;
  return /*#__PURE__*/reactDom.createPortal( /*#__PURE__*/jsxRuntime.jsxs("div", {
    className: styles.root,
    children: [/*#__PURE__*/jsxRuntime.jsx("div", {
      className: ClassNames(styles.modal__overlay, {
        [styles.modal__overlay_closed]: closingAnimate
      }),
      onClick: () => close()
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      className: ClassNames(styles.modal__wrapper, {
        [styles.modal__wrapper_closed]: closingAnimate
      }, className),
      children: /*#__PURE__*/jsxRuntime.jsx("div", {
        className: styles.modal,
        children: children(close, disabled)
      })
    })]
  }), modalRoot);
};

ModalContent.proptypes = {
  children: PropTypes.node.isRequired,
  closingAnimate: PropTypes.bool
};
ModalContent.defaultprops = {
  closingAnimate: false
};

const ModalContext = /*#__PURE__*/React.createContext({
  isOpen: false,
  disabled: false,
  close: () => {}
});
const ModalHook = () => React.useContext(ModalContext);

const Modal = ({
  isOpen,
  children,
  onClose,
  submit,
  className
}) => {
  const [closingAnimate, setClosingAnimate] = React.useState(false);
  const close = React.useCallback(() => {
    setClosingAnimate(true);
    setTimeout(() => {
      setClosingAnimate(false);

      if (onClose) {
        onClose();
      }
    }, 600);
  }, [onClose, setClosingAnimate]);
  const value = React.useMemo(() => ({
    close,
    isOpen
  }), [close, isOpen]);
  return /*#__PURE__*/jsxRuntime.jsx(ModalContext.Provider, {
    value: value,
    children: /*#__PURE__*/jsxRuntime.jsx(ModalContent, {
      closingAnimate: closingAnimate,
      submit: submit,
      className: className,
      children: children
    })
  });
};

const useModal = () => ModalHook();

const Resizeble = ({
  colStyle,
  setColStyle,
  colWidth,
  colKey
}) => {
  const [start, setStart] = React.useState(null);
  const ref = React.useRef(null);

  const handleMouseDown = e => {
    initDrag(e);
  };

  function doDrag(e) {
    const width = start.startWidth + e.clientX - start.startX;
    setColStyle(s => ({ ...s,
      [colKey]: { ...s[colKey],
        width
      }
    }));
  }

  function stopDrag(e) {
    document.documentElement.removeEventListener("mousemove", doDrag, false);
    document.documentElement.removeEventListener("mouseup", stopDrag, false);
  }

  function initDrag(e) {
    const startX = e.clientX;
    setStart({
      startX,
      startWidth: colWidth
    });
  }

  React.useEffect(() => {
    if (start) {
      document.documentElement.addEventListener("mousemove", doDrag, false);
      document.documentElement.addEventListener("mouseup", stopDrag, false);
    }
  }, [start]);
  console.log(colKey, 'WIDTH');
  return /*#__PURE__*/jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [/*#__PURE__*/jsxRuntime.jsx("div", {
      className: "border border_top"
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      ref: ref,
      onMouseDown: handleMouseDown,
      className: "border border_right"
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      className: "border border_left"
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      className: "border border_bottom"
    })]
  });
};

function Cell({
  editorState,
  cellKey,
  onChange,
  index,
  active,
  setActive,
  styleKey,
  headerKey,
  selectGroup,
  clicking,
  enterHandler,
  aligment,
  setSelectGroup,
  cellStyle,
  setColStyle,
  colKey
}) {
  const ref = React.useRef(null);
  const {
    eventState,
    event
  } = styleKey;
  const activeGroup = React.useMemo(() => selectGroup?.includes(cellKey), [selectGroup]);
  const changeStyles = React.useCallback(state => {
    const styles = draftjsUtils.getSelectionInlineStyle(state);
    const appliedStyles = Object.keys(styles).filter(e => styles[e]);
    const difference = appliedStyles.filter(x => !eventState.includes(x)).concat(eventState.filter(x => !appliedStyles.includes(x)));
    let addStyleState = state;

    if (difference.length) {
      difference.forEach(e => {
        addStyleState = draftJs.RichUtils.toggleInlineStyle(state, e);
      });
    }

    return addStyleState;
  }, [eventState]);

  const handleChange = state => {
    const addStyleState = changeStyles(state);
    onChange(s => ({ ...s,
      [cellKey]: { ...s[cellKey],
        editorState: addStyleState
      }
    }));
  };

  React.useEffect(() => {
    if (eventState && event) {
      const addStyleState = changeStyles(editorState);
      onChange(s => ({ ...s,
        [cellKey]: { ...s[cellKey],
          editorState: addStyleState
        }
      }));
    }
  }, [eventState]);
  React.useEffect(() => {
    if (active === cellKey) {
      const state = draftJs.RichUtils.toggleBlockType(editorState, headerKey[cellKey]);
      onChange(s => ({ ...s,
        [cellKey]: { ...s[cellKey],
          editorState: state
        }
      }));
    }
  }, [headerKey]);

  if (!editorState) {
    return null;
  }

  const handleFocus = () => {
    ref.current.editor.focus();
    setActive(cellKey);

    if (!activeGroup) {
      setSelectGroup([]);
    }
  };

  const handleBlur = e => {
    if (active === cellKey) {
      setActive("");
    }
  };

  const handleMouseMove = e => {
    if (clicking) {
      enterHandler(e);
    }
  };

  return /*#__PURE__*/jsxRuntime.jsxs("td", {
    className: ClassNames("content", {
      active: activeGroup
    }),
    onFocus: handleFocus,
    onBlur: handleBlur,
    tabIndex: index,
    "data-key": cellKey,
    onMouseEnter: handleMouseMove,
    style: {
      textAlign: aligment,
      ...cellStyle
    },
    children: [/*#__PURE__*/jsxRuntime.jsx(Resizeble, {
      setColStyle: setColStyle,
      colWidth: cellStyle && cellStyle.width,
      colKey: colKey
    }), /*#__PURE__*/jsxRuntime.jsx("div", {
      className: "content",
      children: /*#__PURE__*/jsxRuntime.jsx(Editor, {
        ref: ref,
        editorState: editorState,
        onChange: handleChange
      })
    })]
  });
}

const Tooltip = props => {
  const ref = React.useRef(null);
  const anchorRef = React.useRef(null);
  const observerRef = React.useRef(null);
  React.useEffect(() => {
    observerRef.current = new ResizeObserver(() => {
      const {
        x,
        y
      } = mouseRef.current;
      const newAnchorRect = anchorRef.current.getBoundingClientRect();

      const isMouseOverAnchor = () => {
        if (newAnchorRect.left <= x && newAnchorRect.right >= x && newAnchorRect.top <= y && newAnchorRect.bottom >= y) {
          return true;
        }

        return false;
      };

      if (isMouseOverAnchor()) {
        shouldOpen.current = true;
      } else {
        shouldOpen.current = false;
        setShow(false);
      }

      setAnchorBox(newAnchorRect);
    });
  }, []);
  const containerRef = React.useRef(null);
  const [overflow, setOverflow] = React.useState(0);
  const mouseRef = React.useRef({});
  const shouldOpen = React.useRef(false);
  const [show, setShow] = React.useState(false);
  const [anchorBox, setAnchorBox] = React.useState({
    x: 0,
    y: 0
  });
  const propsAnchorRef = React.useRef(props.anchor);
  React.useEffect(() => {
    propsAnchorRef.current = props.anchor;
  }, [props.anchor]);
  React.useEffect(() => {
    if (propsAnchorRef.current?.getBoundingClientRect) {
      anchorRef.current = propsAnchorRef;
    } else {
      anchorRef.current = document.querySelector(propsAnchorRef.current) ?? ref.current?.offsetParent ?? ref.current?.parentNode;
    }

    const observer = observerRef.current;

    if (anchorRef.current) {
      observer.observe(anchorRef.current);
    }

    const showFn = () => {
      shouldOpen.current = true;
      setAnchorBox(anchorRef.current.getBoundingClientRect());
    };

    const handleMouseMove = e => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };

      if (!anchorRef.current?.contains(e.target) || ref.current?.contains(e.target)) {
        shouldOpen.current = false;
        setShow(false);
      }
    };

    const handleWheel = e => {
      if (anchorRef.current?.contains(e.target)) {
        setAnchorBox(anchorRef.current?.getBoundingClientRect());
      } else {
        shouldOpen.current = false;
        setShow(false);
      }
    };

    anchorRef.current?.addEventListener('mouseenter', showFn);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);
    return () => {
      anchorRef.current?.removeEventListener('mouseenter', showFn);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      observer.disconnect();
    };
  }, []);
  React.useEffect(() => {
    if (props.container?.getBoundingClientRect) {
      containerRef.current = props.container;
    } else {
      containerRef.current = document.querySelector(props.container) ?? {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          right: window.innerWidth,
          bottom: window.innerHeight
        })
      };
    }
  }, [props.container]);
  React.useEffect(() => {
    if (anchorBox.width) {
      const refBox = ref.current.getBoundingClientRect();
      const containerBox = containerRef.current.getBoundingClientRect();

      if (/^top$|^bottom$/.test(props.orientation)) {
        const leftOffset = containerBox.left - (anchorBox.left + anchorBox.width / 2 - refBox.width / 2);
        const rightOffset = containerBox.right - (anchorBox.right - anchorBox.width / 2 + refBox.width / 2);

        if (leftOffset > 0) {
          setOverflow(leftOffset + 6);
        } else if (rightOffset < 0) {
          setOverflow(rightOffset - 6);
        } else {
          setOverflow(0);
        }
      } else {
        const topOffset = containerBox.top - (anchorBox.top + anchorBox.height / 2 - refBox.height / 2);
        const bottomOffset = containerBox.bottom - (anchorBox.bottom - anchorBox.height / 2 + refBox.height / 2);

        if (topOffset > 0) {
          setOverflow(topOffset + 6);
        } else if (bottomOffset < 0) {
          setOverflow(bottomOffset - 6);
        } else {
          setOverflow(0);
        }
      }
    }

    if (shouldOpen.current) {
      setShow(true);
    }
  }, [anchorBox, props.orientation, props.children]);
  const tipPos = ref.current?.getBoundingClientRect() ?? {};
  const pointerInner = props.size === 'sm' ? 6 : 10;
  const pointerOuter = props.size === 'sm' ? 8 : 12;
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    className: `tooltip ${props.orientation} ${props.size}`,
    ref: ref,
    css: [{
      position: anchorRef.current ? 'fixed' : 'absolute',
      opacity: 0,
      visibility: 'hidden',
      transition: '300ms ease',
      transitionProperty: 'opacity visibility'
    }, show && {
      opacity: 1,
      visibility: 'visible',
      transition: '300ms 200ms ease'
    }, /^top$|^bottom$/.test(props.orientation) && {
      ':before': {
        left: `calc(50% - ${pointerOuter}px - ${overflow}px)`
      },
      ':after': {
        left: `calc(50% - ${pointerInner}px - ${overflow}px)`
      }
    }, /^left$|^right$/.test(props.orientation) && {
      ':before': {
        top: `calc(50% - ${pointerOuter}px - ${overflow}px)`
      },
      ':after': {
        top: `calc(50% - ${pointerInner}px - ${overflow}px)`
      }
    }, props.orientation === 'top' && {
      top: `${anchorBox.top - tipPos.height - pointerOuter}px`,
      left: `${anchorBox.left + anchorBox.width / 2 + overflow - tipPos.width / 2}px`
    }, props.orientation === 'bottom' && {
      top: `${anchorBox.top + anchorBox.height + pointerOuter}px`,
      left: `${anchorBox.left + anchorBox.width / 2 + overflow - tipPos.width / 2}px`
    }, props.orientation === 'left' && {
      top: `${anchorBox.top + anchorBox.height / 2 + overflow - tipPos.height / 2}px`,
      left: `${anchorBox.left - tipPos.width - pointerOuter}px`
    }, props.orientation === 'right' && {
      top: `${anchorBox.top + anchorBox.height / 2 + overflow - tipPos.height / 2}px`,
      left: `${anchorBox.left + anchorBox.width + pointerOuter}px`
    }, {
      maxWidth: props.maxWidth
    }, {
      [`&.tooltip.${props.orientation}.${props.size}`]: props.className
    }],
    "data-testid": show ? 'tooltip-in' : 'tooltip-out',
    children: props.children
  });
};

Tooltip.componentDescription = 'Informational tooltip.';
Tooltip.componentKey = 'tooltip';
Tooltip.componentName = 'Tooltip';
Tooltip.propTypes = {
  container: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  maxWidth: PropTypes.number,
  orientation: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};
Tooltip.defaultProps = {
  maxWidth: 380,
  orientation: 'top',
  size: 'md'
};

const Button$1 = ({
  block,
  children,
  className,
  danger,
  disabled,
  hasTooltipWhenDisabled,
  onClick,
  size,
  tooltip,
  tooltipOrientation,
  tooltipContainer,
  tooltipMaxWidth,
  tooltipSize,
  type
}) => {
  const handleClick = e => {
    stopPropagation(e);

    if (!disabled) {
      onClick();
    }
  };

  const stopPropagation = e => {
    if (typeof e !== 'undefined') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const renderContent = () => {
    const tooltipProps = {
      orientation: tooltipOrientation,
      container: tooltipContainer,
      maxWidth: tooltipMaxWidth,
      size: tooltipSize
    };
    return [/*#__PURE__*/jsxRuntime.jsx("div", {
      className: "btn-content",
      children: children
    }, 'btn-content'), !lodash.isNil(tooltip) && (!disabled || hasTooltipWhenDisabled) && /*#__PURE__*/jsxRuntime.jsx(Tooltip, { ...tooltipProps,
      children: tooltip
    }, 'dropdown')];
  };

  const classes = ['button', danger && 'danger', disabled && 'disabled', type, `size-${size}`, block && 'block', className].filter(Boolean).join(' ');
  const props = {
    children: renderContent(),
    onClick: e => handleClick(e),
    type: 'button'
  };
  return /*#__PURE__*/jsxRuntime.jsx("button", {
    className: classes,
    ...props
  });
};

Button$1.componentDescription = 'Standard extendable button.';
Button$1.componentKey = 'button';
Button$1.componentName = 'Button';
Button$1.propTypes = {
  block: PropTypes.bool,
  className: PropTypes.string,
  danger: PropTypes.bool,
  disabled: PropTypes.bool,
  hasTooltipWhenDisabled: PropTypes.bool,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  tooltip: PropTypes.node,
  tooltipOrientation: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  tooltipContainer: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  tooltipMaxWidth: PropTypes.number,
  tooltipSize: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['primary', 'secondary', 'tertiary'])
};
Button$1.defaultProps = {
  block: false,
  className: '',
  danger: false,
  disabled: false,
  onClick: () => {},
  size: 'md',
  type: 'secondary',
  tooltipSize: 'lg'
};

const Icon = props => {
  function icon(original) {
    const name = original.substring(0, original.length - 4);

    if (original.length - original.indexOf('reg') === 3) {
      return ['far', name];
    } else if (original.length - original.indexOf('lgt') === 3) {
      return ['fal', name];
    } else if (original.length - original.indexOf('sld') === 3) {
      return ['fas', name];
    } else {
      console.error('You have not provided a valid icon type');
      return ['fas', name];
    }
  }

  const iconProps = {
    border: props.border,
    color: props.color,
    'data-testid': props.testid,
    fixedWidth: props.fixedWidth,
    flip: props.flip,
    icon: icon(props.name),
    inverse: props.inverse,
    listItem: props.listItem,
    onClick: e => props.onClick(e),
    pulse: props.pulse,
    rotation: props.rotation,
    size: props.size,
    spin: props.spin,
    style: props.style,
    title: props.title,
    transform: props.transform
  };
  return /*#__PURE__*/jsxRuntime.jsx(reactFontawesome.FontAwesomeIcon, { ...iconProps
  });
};

Icon.componentDescription = 'Icon library.';
Icon.componentKey = 'icon';
Icon.componentName = 'Icon';
Icon.propTypes = {
  border: PropTypes.bool,
  color: PropTypes.string,
  fixedWidth: PropTypes.bool,
  flip: PropTypes.string,
  inverse: PropTypes.bool,
  listItem: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  pulse: PropTypes.bool,
  rotation: PropTypes.number,
  size: PropTypes.string,
  spin: PropTypes.bool,
  style: PropTypes.object
};
Icon.defaultProps = {
  onClick: () => {}
};

const DropdownWrapper = ({
  children
}) => {
  return /*#__PURE__*/jsxRuntime.jsx("div", {
    className: "dropdown__wrapper",
    children: children
  });
};

const Dropdown = ({
  orientation,
  open,
  top,
  children,
  className
}) => {
  const ref = React.useRef();
  const [scrollDiff, setScrollDiff] = React.useState(0);
  const [scrollBottom, setScrollBottom] = React.useState(false);

  const handleScrolling = () => {
    if (ref.current.scrollTop + ref.current.clientHeight === ref.current.scrollHeight) {
      setScrollBottom(true);
    } else {
      setScrollBottom(false);
    }
  };

  React.useEffect(() => {
    if (open && ref.current) {
      setScrollDiff(ref.current.scrollHeight - ref.current.clientHeight);
    } else if (!open) {
      setScrollDiff(0);
      setScrollBottom(false);
    }
  }, [open]);
  return (open || null) && /*#__PURE__*/jsxRuntime.jsxs(DropdownWrapper, {
    className: `dropdown ${className ?? ""} ${orientation === "left" ? 'left' : 'right'}`,
    styles: {
      top
    },
    children: [/*#__PURE__*/jsxRuntime.jsx("div", {
      ref: ref,
      className: "dropdown-content",
      style: scrollDiff <= 18 && {
        maxHeight: `${ref.current?.scrollHeight}px !important`
      },
      onScroll: handleScrolling,
      children: children
    }), scrollDiff > 18 && /*#__PURE__*/jsxRuntime.jsxs("div", {
      style: {
        fontSize: "12px",
        paddingLeft: 6,
        background: "#ffcf8f",
        color: "#333",
        borderBottomRightRadius: 3,
        borderBottomLeftRadius: 3,
        transition: "opacity 200ms ease-in-out",
        opacity: scrollBottom && 0.2
      },
      children: ["scroll for more ", /*#__PURE__*/jsxRuntime.jsx(Icon, {
        name: "arrow-down-sld"
      })]
    })]
  });
};

Dropdown.componentDescription = "Generic dropdown menu.";
Dropdown.componentKey = "dropdown";
Dropdown.componentName = "Dropdown menu";
Dropdown.propTypes = {
  open: PropTypes.bool,
  orientation: PropTypes.oneOf(["left", "right"]),
  top: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
Dropdown.defaultProps = {
  orientation: "right",
  top: "50px"
};

const DropdownBtn = ({
  container,
  dropdownOpen,
  dropdownOrientation,
  onButtonClick,
  ...props
}) => {
  const ref = React.useRef();
  useClickOutside(ref, () => {
    if (dropdownOpen) {
      onButtonClick();
    }
  });
  const [orientation, setOrientation] = React.useState(dropdownOrientation);
  React.useLayoutEffect(() => {
    let containerRef = container;

    if (dropdownOpen && container) {
      if (!lodash.isElement(container)) {
        containerRef = document.getElementById(container);
      }

      const dimensions = containerRef?.getBoundingClientRect();
      const left = ref.current?.getBoundingClientRect().left - dimensions?.left;
      setOrientation(left < dimensions?.width / 2 ? "left" : "right");
    } else if (dropdownOpen) {
      setOrientation(dropdownOrientation);
    }
  }, [container, dropdownOpen, dropdownOrientation]);
  const {
    buttonContent,
    styles,
    ...otherProps
  } = props;
  const buttonProps = {
    disabled: props.buttonDisabled,
    onClick: onButtonClick,
    size: props.buttonSize,
    type: props.buttonType
  };
  console.log(props, "PROPS");
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    ref: ref,
    ...otherProps,
    className: `dropdown-button ${props.className ?? ""}`,
    children: [/*#__PURE__*/jsxRuntime.jsx(Button$1, { ...buttonProps,
      children: props.buttonContent
    }), /*#__PURE__*/jsxRuntime.jsx(Dropdown, {
      open: dropdownOpen,
      orientation: orientation,
      children: props.children
    })]
  });
};

DropdownBtn.componentDescription = "Button that opens a dropdown menu.";
DropdownBtn.componentKey = "dropdownBtn";
DropdownBtn.componentName = "Dropdown button";
DropdownBtn.propTypes = {
  buttonContent: PropTypes.node,
  buttonDisabled: PropTypes.bool,
  buttonSize: PropTypes.string,
  buttonType: PropTypes.string,
  container: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  dropdownOpen: PropTypes.bool,
  dropdownOrientation: PropTypes.string,
  onButtonClick: PropTypes.func
};
DropdownBtn.defaultProps = {
  onButtonClick: () => {}
};

class RichEditorDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.dropdownRef = /*#__PURE__*/React.createRef();
    const {
      controlWidth,
      dropdownWidth
    } = this.props;
    this.state = {
      showDropdown: false,
      open: false,
      controlWidth: controlWidth || 50,
      dropdownWidth: dropdownWidth && dropdownWidth + 'px' || 'fit-content',
      orientation: 'left'
    };
  }

  componentDidMount() {
    this.setState({
      showDropdown: true
    });
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      this.handleButtonClick();
    }
  }

  handleButtonClick() {
    this.setState(({
      open
    }) => ({
      open: !open
    }));
  }

  handleSubmit(style) {
    this.props.onSelect(style);
    this.handleButtonClick();
  }

  renderBtnContent() {
    const {
      name,
      icon,
      style
    } = this.props.activeOption.display;
    return /*#__PURE__*/jsxRuntime.jsxs(React.Fragment, {
      children: [icon ? /*#__PURE__*/jsxRuntime.jsx(Icon, {
        name: icon
      }) : null, name ? /*#__PURE__*/jsxRuntime.jsx("span", {
        style: style,
        children: name
      }) : null]
    });
  }

  render() {
    if (!this.state.showDropdown) return null;
    const dropdownProps = {
      buttonContent: this.renderBtnContent(),
      dropdownOpen: this.state.open,
      dropdownOrientation: this.state.orientation,
      onButtonClick: () => this.handleButtonClick(),
      styles: this.state,
      ...(!this.props.allowInput && {
        onMouseDown: e => e.preventDefault()
      })
    };
    const contentProps = {
      handleSubmit: result => this.handleSubmit(result),
      open: this.state.open,
      ...this.props
    };
    return /*#__PURE__*/jsxRuntime.jsx(DropdownBtn, { ...dropdownProps,
      children: this.props.render(contentProps)
    });
  }

}
RichEditorDropdown.propTypes = {
  activeOption: PropTypes.shape({
    display: PropTypes.object.isRequired,
    type: PropTypes.string
  }),
  allowInput: PropTypes.bool,
  render: PropTypes.func
};
RichEditorDropdown.defaultProps = {
  activeOption: {
    display: {}
  },
  allowInput: false,
  render: () => {}
};

const Content = props => {
  return /*#__PURE__*/jsxRuntime.jsx("ul", {
    children: props.list.map((item, index) => {
      const icon = item.display.icon ? /*#__PURE__*/jsxRuntime.jsx(Icon, {
        name: item.display.icon
      }) : null;
      const result = item.type || item.display.name;
      return /*#__PURE__*/jsxRuntime.jsxs("li", {
        style: item.display.style,
        onClick: () => props.handleSubmit(result),
        children: [icon, " ", item.display.name]
      }, index);
    })
  });
};

const Toolbar = ({
  setAligment,
  alignment,
  selectGroup,
  setGroupAligment
}) => {
  const name = "alignment";

  const handleSelect = type => {
    if (selectGroup.length) {
      return setGroupAligment(type);
    }

    return setAligment(type);
  };

  const controlProps = {
    activeOption: dropdownOptions[name].activeOption(alignment ? alignment : 'justify'),
    controlWidth: dropdownOptions[name].controlWidth,
    dropdownWidth: dropdownOptions[name].dropdownWidth,
    key: name,
    list: availableAlignments,
    onSelect: handleSelect
  };
  return /*#__PURE__*/jsxRuntime.jsx(RichEditorDropdown, {
    render: props => /*#__PURE__*/jsxRuntime.jsx(Content, { ...props
    }),
    ...controlProps
  });
};

const initialCell = {
  rowKey: "",
  colKey: "",
  editorState: draftJs.EditorState.createEmpty(),
  aligment: "left"
};
const tolbarStyleButtons = inlineStylesTypes.map(s => ({
  name: s.charAt(0),
  className: "toolbar__button",
  dataStyle: s
}));
const initCellStyle = {
  minWidth: 50,
  width: 200
};
const blockTypes = [...HEADER_TYPES, ...BLOCK_TYPES];

const createIndexes = arr => {
  if (!arr) return null;
  return arr.reduce((acc, c, i) => {
    acc[c] = i;
    return acc;
  }, {});
};

function ModalTable({
  closeModal
}) {
  const modalCtx = React.useContext(ModalCtx);
  const {
    modal
  } = modalCtx;
  const [row, setRow] = React.useState(modal.row || null);
  const [col, setCol] = React.useState(modal.col || null);
  const [colStyle, setColStyle] = React.useState(modal.colStyle || null);
  const [cell, setCell] = React.useState(modal.cell || null);
  const [active, setActive] = React.useState("");
  const [styleKey, setStyleKey] = React.useState({
    event: "",
    eventState: []
  });
  const [headerKey, setHeaderKey] = React.useState({});
  const [selectGroup, setSelectGroup] = React.useState([]);
  const [aligment, setAligment] = React.useState("");
  const [groupAligment, setGroupAligment] = React.useState("");
  const {
    defaultSchema
  } = modal;

  function createState() {
    const rowArr = [];
    const cellObject = {};
    const colArr = [];
    let colKey = null;
    defaultSchema.forEach((r, i) => {
      const rowKey = draftJs.genKey();
      rowArr.push(rowKey);
      r.forEach((c, j) => {
        if (i === 0) {
          colKey = draftJs.genKey();
          colArr.push(colKey);
        }

        const cellKey = draftJs.genKey();
        cellObject[cellKey] = { ...initialCell,
          rowKey,
          cellKey,
          colKey: colArr[j],
          aligment
        };
      });
    });
    setRow(rowArr);
    setCell(cellObject);
    setCol(colArr);
  }

  React.useEffect(() => {
    if (modal.isOpen && defaultSchema && !modal.tableSchema) {
      createState();
    }
  }, [modal]);
  const renderSchema = React.useMemo(() => {
    if (!row || !cell || !col) {
      return [];
    }

    const colIndexMap = createIndexes(col);
    const rowIndexMap = createIndexes(row);
    return Object.keys(cell).reduce((acc, c) => {
      const {
        rowKey,
        colKey
      } = cell[c];
      acc[rowIndexMap[rowKey]] = acc[rowIndexMap[rowKey]] ?? [];
      acc[rowIndexMap[rowKey]][colIndexMap[colKey]] = cell[c];
      return acc;
    }, []);
  }, [row, cell, col]);

  function handleSave() {
    const getSchema = renderSchema;
    const prepareSchema = getSchema.map(r => r.map(c => {
      const contentState = c.editorState.getCurrentContent();
      c["contentState"] = contentState;
      return c;
    }));
    const {
      generalEditorState
    } = modal;
    let contentState = generalEditorState.getCurrentContent();
    let selection = generalEditorState.getSelection();
    contentState = draftJs.Modifier.splitBlock(contentState, selection);
    const blockArray = contentState.getBlocksAsArray();
    const currBlock = blockArray.find(e => e.getData().get("tableKey") === modal.tableKey);
    const index = blockArray.findIndex(block => block === currBlock);
    const data = currBlock.getData();
    const newData = data.set("tableSchema", prepareSchema).set("row", row).set("cell", cell).set("col", col).set("colStyle", colStyle);
    const newBlock = new draftJs.ContentBlock({
      key: draftJs.genKey(),
      type: "table",
      text: " ",
      data: newData
    });
    blockArray.splice(index, 1, newBlock);
    const entityMap = contentState.getEntityMap();
    contentState = draftJs.ContentState.createFromBlockArray(blockArray, entityMap);
    let newEditorState = draftJs.EditorState.push(generalEditorState, contentState, "insert-fragment");
    const key = blockArray[0].getKey();
    selection = draftJs.SelectionState.createEmpty(key);
    newEditorState = draftJs.EditorState.acceptSelection(newEditorState, selection);
    modal.onChange(newEditorState);
    closeModal();
  }

  React.useEffect(() => {
    setCell(s => {
      if (!aligment && !groupAligment) {
        return s;
      }

      if (active) {
        return { ...s,
          [active]: { ...s[active],
            aligment
          }
        };
      }

      return Object.keys(s).reduce((acc, c) => {
        acc[c] = { ...s[c],
          aligment
        };
        return acc;
      }, {});
    });
  }, [aligment]);
  React.useEffect(() => {
    setCell(s => {
      const group = selectGroup.reduce((acc, c) => {
        acc[c] = { ...s[c],
          aligment: groupAligment
        };
        return acc;
      }, {});
      return { ...s,
        ...group
      };
    });
  }, [groupAligment]);

  if (!modal.isOpen) {
    return null;
  }

  function handleToolbar(e) {
    e.preventDefault();
    const style = e.target.getAttribute("data-style");
    setStyleKey(s => {
      const styleInArray = s.eventState.includes(style);
      let state = [];

      if (styleInArray) {
        state = s.eventState.filter(k => k !== style);
      } else {
        state = [...s.eventState, style];
      }

      return { ...s,
        event: style,
        eventState: state
      };
    });
  }

  const handleHeaderTypes = e => {
    e.preventDefault();
    const style = e.target.getAttribute("data-style");

    if (active) {
      setHeaderKey(s => {
        if (!s[active]) {
          s[active] = {};
        }

        if (s[active] === style) {
          return { ...s,
            [active]: ""
          };
        }

        return { ...s,
          [active]: style
        };
      });
    }
  };

  console.log(colStyle && colStyle, "ACTIVE");
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    className: "table__wrapper",
    children: [/*#__PURE__*/jsxRuntime.jsx("div", {
      className: "toolbar__wrapper",
      children: /*#__PURE__*/jsxRuntime.jsxs("ul", {
        className: "toolbar",
        children: [tolbarStyleButtons.map(e => /*#__PURE__*/jsxRuntime.jsx("li", {
          children: /*#__PURE__*/jsxRuntime.jsx("button", {
            "data-style": e.dataStyle,
            "data-active": styleKey.eventState.some(k => k === e.dataStyle),
            className: e.className,
            onMouseDown: handleToolbar,
            children: e.name
          })
        }, e.dataStyle)), /*#__PURE__*/jsxRuntime.jsx("ul", {
          className: "toolbar",
          children: blockTypes.map(e => /*#__PURE__*/jsxRuntime.jsx("li", {
            children: /*#__PURE__*/jsxRuntime.jsx("button", {
              onMouseDown: handleHeaderTypes,
              "data-style": e.style,
              "data-active": headerKey[active] && headerKey[active] === e.style,
              className: "toolbar__button",
              children: e.label
            })
          }, e.label))
        }), /*#__PURE__*/jsxRuntime.jsx(Toolbar, {
          setAligment: setAligment,
          alignment: aligment,
          groupAligment: groupAligment,
          setGroupAligment: setGroupAligment,
          selectGroup: selectGroup
        })]
      })
    }), /*#__PURE__*/jsxRuntime.jsx(EditTableWrapper, {
      setSelectGroup: setSelectGroup,
      selectGroup: selectGroup,
      col: col,
      row: row,
      cell: cell,
      active: active,
      setCol: setCol,
      setCell: setCell,
      colStyle: colStyle,
      setColStyle: setColStyle,
      children: ({
        clicking,
        enterHandler
      }) => /*#__PURE__*/jsxRuntime.jsx(jsxRuntime.Fragment, {
        children: /*#__PURE__*/jsxRuntime.jsx("tbody", {
          children: renderSchema.map((row, j) => /*#__PURE__*/jsxRuntime.jsx("tr", {
            children: row.map((cell, i) => /*#__PURE__*/jsxRuntime.jsx(Cell, {
              index: i,
              ...cell,
              onChange: setCell,
              setActive: setActive,
              styleKey: styleKey,
              headerKey: headerKey,
              active: active,
              selectGroup: selectGroup,
              setSelectGroup: setSelectGroup,
              clicking: clicking,
              enterHandler: enterHandler,
              setColStyle: setColStyle,
              cellStyle: colStyle && colStyle[cell.colKey]
            }, cell.cellKey))
          }, j))
        })
      })
    }), /*#__PURE__*/jsxRuntime.jsx("button", {
      onClick: handleSave,
      children: "save"
    })]
  });
}

function EditTableWrapper({
  children,
  setSelectGroup,
  col,
  row,
  cell,
  selectGroup,
  active,
  setCell,
  setCol,
  setColStyle,
  colStyle
}) {
  const ref = React.useRef(null);
  const [clicking, setClicking] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState({
    isOpen: false,
    target: null
  });
  const colMap = createIndexes(col);
  const rowMap = createIndexes(row);

  const eventEnter = e => {
    const key = e.currentTarget.dataset.key;
    const currentCell = cell[key];
    const {
      rowKey,
      colKey
    } = currentCell;
    const curColIndex = colMap[colKey];
    const startColIndex = colMap[cell[active].colKey];
    const startRowIndex = rowMap[cell[active].rowKey];
    const curRowIndex = rowMap[rowKey];
    const correctCols = Object.keys(colMap).filter(c => {
      if (curColIndex >= startColIndex) {
        return colMap[c] <= curColIndex && colMap[c] >= startColIndex;
      }

      return colMap[c] >= curColIndex && colMap[c] <= startColIndex;
    });
    const correctRows = Object.keys(rowMap).filter(r => {
      if (curRowIndex >= startRowIndex) {
        return rowMap[r] <= curRowIndex && rowMap[r] >= startRowIndex;
      }

      return rowMap[r] >= curRowIndex && rowMap[r] <= startRowIndex;
    });
    const result = Object.keys(cell).filter(c => {
      const rKey = cell[c].rowKey;
      const cKey = cell[c].colKey;
      return correctCols.includes(cKey) && correctRows.includes(rKey);
    });
    setSelectGroup(result);
  };

  const handleMouseDown = e => {
    if (e.button === 0) {
      return setClicking(true);
    }
  };

  const handleMouseOver = e => {
    setClicking(false);
  };

  const handleKeyUp = e => {
    if (e.which === 27 && selectGroup.length) {
      e.preventDefault();
      e.stopPropagation();
      setSelectGroup([]);
    }
  };

  const handleContext = e => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      target: e.currentTarget,
      event: e
    });
  };

  function handleCol({
    currentTarget
  }) {
    const type = currentTarget.getAttribute("data-value");
    const colArr = [...col];
    const needItems = row.length;
    const newColKey = draftJs.genKey();
    const insertObject = {};

    for (let i = 0; i < needItems; i++) {
      const cellKey = draftJs.genKey();
      insertObject[cellKey] = { ...initialCell,
        rowKey: row[i],
        colKey: newColKey,
        cellKey
      };
    }

    if (active) {
      const {
        colKey
      } = cell[active];
      const curIndex = col.findIndex(e => e === colKey);
      const updateIndex = curIndex + +type;
      colArr.splice(updateIndex, 0, newColKey);
    } else {
      colArr.push(newColKey);
    }

    setCol(colArr);
    setCell(s => ({ ...s,
      ...insertObject
    }));
    setContextMenu(s => ({ ...s,
      isOpen: false
    }));
  }

  const handleSelect = ({
    target
  }) => {
    if (!active) {
      return null;
    }

    const type = target.getAttribute("data-object");
    const neededKey = type === "col" ? "colKey" : "rowKey";
    const key = cell[active][neededKey];
    const selectedItems = Object.keys(cell).filter(e => key === cell[e][neededKey]);
    setSelectGroup(selectedItems);
    setContextMenu(s => ({ ...s,
      isOpen: false
    }));
  };

  React.useEffect(() => {
    if (ref.current && !colStyle && col) {
      const tableWidth = ref.current.clientWidth;
      const cellWidth = tableWidth / col.length;
      const resizeState = col.reduce((acc, e) => {
        if (!acc[e]) {
          acc[e] = {};
        }

        acc[e] = { ...initCellStyle,
          width: cellWidth
        };
        return acc;
      }, {});
      setColStyle(resizeState);
    }
  }, [ref.current, colStyle, col]);
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    className: "table__wrapper",
    ref: ref,
    children: [/*#__PURE__*/jsxRuntime.jsx("table", {
      className: "table table__edit",
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseOver,
      onMouseLeave: handleMouseOver,
      onKeyUp: handleKeyUp,
      onContextMenu: handleContext,
      children: children({
        enterHandler: eventEnter,
        clicking
      })
    }), /*#__PURE__*/jsxRuntime.jsxs(TableCtxMenu, {
      contextMenu: contextMenu,
      changeMenu: setContextMenu,
      children: [/*#__PURE__*/jsxRuntime.jsx("button", {
        onClick: handleCol,
        "data-value": 0,
        children: "add col before"
      }), /*#__PURE__*/jsxRuntime.jsx("button", {
        onClick: handleCol,
        "data-value": 1,
        children: "add col after"
      }), /*#__PURE__*/jsxRuntime.jsx("button", {
        onClick: handleSelect,
        "data-object": "col",
        children: "select col"
      }), /*#__PURE__*/jsxRuntime.jsx("button", {
        onClick: handleSelect,
        "data-object": "row",
        children: "select row"
      })]
    })]
  });
}

function getPosition(e) {
  let posx = 0;
  let posy = 0;
  if (!e) e = window.event;

  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  return {
    x: posx,
    y: posy
  };
}

function TableCtxMenu({
  contextMenu,
  changeMenu,
  children
}) {
  const {
    isOpen,
    target,
    event
  } = contextMenu;
  const [style, setStyle] = React.useState({});
  const ref = React.useRef(null);
  const childrenArray = React.Children.toArray(children);
  React.useEffect(() => {
    const {
      x,
      y
    } = getPosition(event);

    if (ref.current) {
      const w = ref.current.clientWidth;
      const {
        width
      } = target.getBoundingClientRect();
      let left = x - 50;

      if (width - left < w) {
        left = width - w;
      }

      setStyle({
        top: y - 50,
        left
      });
    }
  }, [event]);

  if (!isOpen) {
    return null;
  }

  return /*#__PURE__*/jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [/*#__PURE__*/jsxRuntime.jsx("ul", {
      ref: ref,
      className: "context__menu",
      style: style,
      children: childrenArray.map((e, i) => {
        return /*#__PURE__*/jsxRuntime.jsx("li", {
          children: /*#__PURE__*/React.cloneElement(e, {
            className: "context__item"
          })
        }, i);
      })
    }), /*#__PURE__*/jsxRuntime.jsx("span", {
      className: "context__overlay",
      onClick: () => {
        changeMenu({
          isOpen: false,
          target: false
        });
      }
    })]
  });
}

const ModalCtx = /*#__PURE__*/React.createContext();
const initialModal = {
  isOpen: false,
  defaultSchema: null,
  editorState: null,
  generalEditorState: null,
  tableKey: "",
  tableSchema: null
};
function App({
  children
}) {
  const [modal, setModal] = React.useState(initialModal);
  console.log("cmponent has been included!!!");
  return /*#__PURE__*/jsxRuntime.jsxs(ModalCtx.Provider, {
    value: {
      modal,
      handleModal: setModal,
      handleEditor: draftJs.Editor.onChange
    },
    children: [children, /*#__PURE__*/jsxRuntime.jsx(Modal, {
      isOpen: modal.isOpen,
      onClose: () => {
        setModal(s => ({ ...s,
          isOpen: false
        }));
      },
      children: close => /*#__PURE__*/jsxRuntime.jsx(ModalTable, {
        closeModal: close
      })
    })]
  });
}

const customStyleMap = (() => {
  const styleMap = { ...draftJs.DefaultDraftInlineStyle
  };
  ['backgroundColor', 'color'].forEach(style => {
    COLORS.forEach(color => {
      styleMap[`${style}.${color}`] = {
        [style]: color
      };
    });
  });
  FONTS.forEach(font => {
    styleMap[`fontFamily.${font}`] = {
      fontFamily: font
    };
  });
  FONT_SIZES.forEach(size => {
    styleMap[`fontSize.${size}`] = {
      fontSize: `${size}pt`
    };
  });
  return styleMap;
})();
const customStyleFn = style => {
  const defaultStyles = style.intersect(['BOLD', 'CODE', 'ITALIC', 'UNDERLINE']).reduce((map, v) => {
    return map.merge(customStyleMap[v]);
  }, immutable.Map());
  style = style.subtract(['BOLD', 'CODE', 'ITALIC', 'UNDERLINE']);
  let groupedStyles = style.filter(v => v.includes(':'));
  style = style.subtract(groupedStyles);
  groupedStyles = groupedStyles.reduce((map, v) => {
    v = convertStyleStringToObject(v);
    v = immutable.Map(v).mapKeys(k => lodash.camelCase(k));
    return map.merge(v);
  }, immutable.Map());
  style = style.map(v => v.split('.')).filter(v => v.every(vv => vv.length)).reduce((map, v) => {
    const key = v.shift().trim();
    const val = v.join('.').trim();
    return map.merge({
      [key]: val
    });
  }, groupedStyles.merge(defaultStyles)).toJS();

  if (lodash.isEmpty(style)) {
    return null;
  }

  return style;
};

function convertStyleStringToObject(style = '', data = {}) {
  if (!style) {
    return null;
  }

  return style.split(';').filter(s => s.includes(':')).map(s => s.split(':')).reduce((map, s) => {
    const key = s.shift().trim();
    const val = s.join(':').trim();
    map[key] = val;
    return map;
  }, data);
}

const getStateToHtmlOptions = contentState => ({
  inlineStyles: (() => {
    const styles = {
      BOLD: {
        style: {
          fontWeight: 'bold'
        }
      },
      ITALIC: {
        style: {
          fontStyle: 'italic'
        }
      },
      UNDERLINE: {
        style: {
          textDecoration: 'underline'
        }
      },
      STRIKETHROUGH: {
        style: {
          textDecoration: 'line-through'
        }
      }
    };
    ['backgroundColor', 'color'].forEach(style => {
      COLORS.forEach(color => {
        styles[`${style}.${color}`] = {
          style: {
            [style]: color
          }
        };
      });
    });
    FONTS.forEach(font => {
      styles[`fontFamily.${font}`] = {
        style: {
          fontFamily: font
        }
      };
    });
    FONT_SIZES.forEach(size => {
      styles[`fontSize.${size}`] = {
        style: {
          fontSize: `${size}pt`
        }
      };
    });
    return styles;
  })(),
  inlineStyleFn: style => {
    style = customStyleFn(style);
    return style && {
      element: 'span',
      style
    };
  },
  blockRenderers: {
    'code-block': block => {
      const blockStyles = immutable.OrderedSet(defaultPreTagStyling.map(v => v.join(': ')));
      return `<pre${getClassesAndStyles({
        block,
        blockStyles
      })}>${buildHtmlForBlockText('', block, contentState)}</pre>`;
    },
    'page-break': block => {
      return '<div style="page-break-after: always"><br></div>';
    },
    paragraph: block => {
      if (block.getLength() === 0) {
        return `<p${getClassesAndStyles({
          block
        })}><br></p>`;
      }

      const result = `<p${getClassesAndStyles({
        block
      })}>${buildHtmlForBlockText('', block, contentState)}</p>`;
      return result;
    },
    unstyled: block => {
      if (block.getLength() === 0) {
        return `<div${getClassesAndStyles({
          block
        })}><br></div>`;
      }

      const result = `<div${getClassesAndStyles({
        block
      })}>${buildHtmlForBlockText('', block, contentState)}</div>`;
      return result;
    },
    'horizontal-rule': block => {
      return '<hr>';
    },
    atomic: block => {
      const data = block.getData();
      let figStyle = [];
      let imgStyle = [];
      let classes = [];
      data.forEach((v, k) => {
        if (v === 'class') {
          classes.push(k);
        } else if (k === 'imgStyle') {
          v.forEach((vv, kk) => imgStyle.push(`${kk}: ${vv}`));
        } else {
          figStyle.push(`${k}: ${v}`);
        }
      });
      const float = data.get('float');

      if (float && !data.get('margin')) {
        figStyle.push(float === 'right' ? 'margin: 0 8px 0 0' : 'margin: 0 0 0 8px');
      }

      if (block.get('depth')) {
        figStyle.push(`margin-left: ${block.get('depth') * 2.5}em; `);
      }

      classes = classes.join(' ') && ` class="${classes.join(' ')}"`;
      figStyle = figStyle.join('; ') && ` style="${figStyle.join('; ')}"`;
      imgStyle = ` style="${imgStyle.join('; ')}"`;
      const {
        src
      } = block.getEntityAt(0) && contentState.getEntity(block.getEntityAt(0)).getData() || {};
      return `<figure${classes}${figStyle}><img src="${src}"${imgStyle}/></figure>`;
    },
    'pasted-list-item': block => {
      const prevBlock = contentState.getBlockBefore(block.getKey());

      if (prevBlock?.getType() === block.getType()) {
        return '';
      }

      const data = block.getData();
      let start = data.get('listStart');
      start = start && ` start="${start}"` || '';
      let listStyles = immutable.Map(data.get('listStyles')).reduce((set, v, k) => {
        return set.add(`${k}: ${v}`);
      }, immutable.OrderedSet()).toArray().join('; ');
      listStyles = listStyles && ` style="${listStyles}"`;
      const listItems = contentState.getBlockMap().skipUntil(v => v === block).takeWhile(v => v.getType().endsWith('list-item')).toList();
      const listTag = block.getData().get('listStart') > 0 ? 'ol' : 'ul';
      let currentDepth = block.getDepth();
      return `<${listTag}${listStyles}${start}>${listItems.map(block => {
        const depth = block.getDepth();
        const openTag = depth > currentDepth ? `<${listTag}><li` : depth < currentDepth ? `</${listTag}><li` : '<li';
        currentDepth = depth;
        return `
${openTag}${getClassesAndStyles({
          block
        })}>${buildHtmlForBlockText('', block, contentState)}</li>`;
      }).toArray().join('')}</${listTag}>`;
    },
    table: block => {
      const prevBlock = contentState.getBlockBefore(block.getKey());

      if (prevBlock && prevBlock.getType() === 'table') {
        return '';
      }

      const data = block.getData();
      const tableShape = data.get('tableShape');

      if (!tableShape) {
        return '<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>';
      }

      let tableStyle = immutable.Map(data.get('tableStyle')).reduce((set, v, k) => {
        return set.add(`${k}: ${v}`);
      }, immutable.OrderedSet()).toArray().join('; ');
      tableStyle = tableStyle && ` style="${tableStyle}"`;
      const tableKey = data.get('tableKey');
      const tableBlocks = contentState.getBlockMap().skipUntil(v => v.getType() === 'table' && v.getData().get('tableKey') === tableKey).takeWhile(v => v.getType() === 'table').toList();
      const colgroup = data.get('tableColgroup') ?? '';
      let cellCounter = 0;
      return `<table${tableStyle}>${colgroup}<tbody>${tableShape.map((row, i) => {
        let rowStyle = immutable.Map(block.getData().get('rowStyle')[i]).reduce((set, v, k) => {
          return set.add(`${k}: ${v}`);
        }, immutable.OrderedSet()).toArray().join('; ');
        rowStyle = rowStyle && ` style="${rowStyle}"`;
        return `<tr${rowStyle}>${row.map((cell, j) => {
          const tag = cell.element;
          let cellStyle = immutable.Map(cell.style).reduce((set, v, k) => {
            return set.add(`${k}: ${v}`);
          }, immutable.OrderedSet()).toArray().join('; ');
          cellStyle = cellStyle && ` style="${cellStyle}"`;
          let cellBlock = tableBlocks.get(cellCounter);
          let colspan = cellBlock.getData().get('colspan');
          colspan = colspan ? ` colspan=${colspan}` : '';
          let rowspan = cellBlock.getData().get('rowspan');
          rowspan = rowspan ? ` rowspan=${rowspan}` : '';
          const [, rowNum, colNum] = cellBlock?.getData().get('tablePosition').split('-') ?? [];

          if (i !== +rowNum || j !== +colNum) {
            cellBlock = null;
          } else {
            cellCounter++;
          }

          return `<${tag}${cellStyle}${colspan}${rowspan}>${buildHtmlForBlockText('', cellBlock, contentState)}</${tag}>`;
        }).join('')}</tr>`;
      }).join('')}</tbody></table>`;
    }
  },
  defaultBlockTag: 'div',
  entityStyleFn: entity => {
    const entityType = entity.get('type').toLowerCase();

    if (entityType === 'video') {
      const {
        src
      } = entity.getData();
      return {
        element: 'video',
        attributes: {
          src: src
        }
      };
    }
  }
});

function getClassesAndStyles({
  block,
  blockStyles = immutable.OrderedSet(),
  classes = immutable.OrderedSet()
}) {
  const data = block.getData();
  data.filter((v, k) => !['depth', 'listStyles', 'listStart'].includes(k)).forEach((v, k) => {
    if (v === 'class') {
      classes = classes.add(k);
    } else {
      blockStyles = blockStyles.add(`${k}: ${v}`);
    }
  });
  const margin = block.get('depth');

  if (margin) {
    blockStyles = immutable.OrderedSet.of([`margin-left: ${margin * 2.5}em`]).union(blockStyles);
  }

  classes = classes.size && ` class="${classes.toArray().join(' ')}"` || '';
  blockStyles = blockStyles.size && ` style="${blockStyles.toArray().join('; ')}"` || '';
  return `${classes}${blockStyles}`;
}

function buildHtmlForBlockText(result, block, contentState) {
  if (!block) {
    return '<span>&nbsp;</span>';
  }

  block.findStyleRanges(() => true, (s, e) => {
    let close = '';
    let styles = block.getInlineStyleAt(s);
    styles = immutable.Map(customStyleFn(styles)).reduce((styleSet, v, k) => {
      k = lodash.kebabCase(k);
      if (k === 'font-size' && /^\d*$/.test(v)) v += 'pt';
      return styleSet.add(`${k}: ${v}`);
    }, immutable.OrderedSet()).toArray().join('; ');
    styles = styles ? ` style="${styles}"` : '';
    const startKey = block.getEntityAt(s);
    const endKey = block.getEntityAt(e - 1);
    const entity = startKey && startKey === endKey ? contentState.getEntity(startKey) : null;

    if (styles) {
      result += `<span${styles}>`;
      close = '</span>' + close;
    }

    const textContent = block.getText().slice(s, e).replace(/\n/g, '<br/>').replace(/\s{2,}?/g, '&nbsp;&nbsp;').replace(/^\s$/g, '&nbsp;');

    if (entity && entity.get('type') === 'LINK') {
      const {
        url,
        target
      } = entity.getData();
      result += `<a href="${url}" ${target ? `target="${target}" rel="noreferrer"` : ''}>${textContent}</a>`;
    } else {
      result += textContent;
    }

    result += close;
  });
  return result;
}

function RenderTable(props) {
  const [initialCellWidth, setInitialCellWidt] = React.useState(200);
  const wrapperRef = React.useRef(null);
  const editor = props.blockProps.getEditorRef();
  const editorState = props.blockProps.getEditorState();
  const {
    onChange
  } = props.blockProps.getProps();
  const {
    block
  } = props;
  const data = block.getData();
  const tableKey = data.get("tableKey");
  const defaultSchema = data.get("defaultSchema");
  const tableSchema = data.get("tableSchema");
  const row = data.get("row");
  const cell = data.get("cell");
  const col = data.get("col");
  const aligment = data.get("aligment");
  const colStyle = data.get("colStyle");
  const schema = tableSchema || defaultSchema;
  const modalCtx = React.useContext(ModalCtx);

  function handleModalChange() {
    modalCtx.handleModal(s => ({ ...s,
      isOpen: !s.isOpen,
      generalEditorState: editorState,
      defaultSchema,
      tableSchema,
      tableKey,
      onChange,
      row,
      cell,
      col,
      aligment,
      colStyle
    }));
  }

  const syncContenteditable = disabled => {
    if (disabled) {
      const editableDivs = editor.current?.editor.querySelectorAll('[contenteditable="true"]') ?? [];
      editableDivs.forEach(div => {
        div.setAttribute("contenteditable", "false");
        div.setAttribute("data-editable-disabled", "true");
      });
    } else if (!disabled) {
      const editableDivs = editor.current?.editor.querySelectorAll('[data-editable-disabled="true"]') ?? [];
      editableDivs.forEach(div => {
        div.setAttribute("contenteditable", "true");
        div.removeAttribute("data-editable-disabled");
      });
    }
  };

  React.useEffect(() => {
    syncContenteditable(props.disabled);
  }, [props.disabled]);
  React.useEffect(() => {
    if (wrapperRef.current && schema[0]?.length) {
      setInitialCellWidt(wrapperRef?.current.clientWidth / schema[0]?.length);
    }
  }, [wrapperRef, schema]);
  return /*#__PURE__*/jsxRuntime.jsx(jsxRuntime.Fragment, {
    children: /*#__PURE__*/jsxRuntime.jsxs("div", {
      className: "wrapper",
      ref: wrapperRef,
      children: [/*#__PURE__*/jsxRuntime.jsx("table", {
        id: tableKey,
        border: 1,
        className: "RenderTableWrapper",
        children: /*#__PURE__*/jsxRuntime.jsx("tbody", {
          children: schema.map((row, i) => /*#__PURE__*/jsxRuntime.jsx("tr", {
            children: row.map((cell, j) => {
              const width = colStyle && colStyle[cell.colKey]?.width;

              if (!cell.contentState) {
                return /*#__PURE__*/jsxRuntime.jsx("td", {
                  "data-position": `${tableKey}-${i}-${j}`,
                  style: {
                    width: initialCellWidth
                  },
                  children: /*#__PURE__*/jsxRuntime.jsx("div", {
                    className: "content",
                    style: {
                      minHeight: "16px"
                    }
                  })
                }, j);
              }

              const options = getStateToHtmlOptions(cell.contentState);
              const content = draftJsExportHtml.stateToHTML(cell.contentState, options);
              const aligment = cell?.aligment || "center";
              return /*#__PURE__*/jsxRuntime.jsxs("td", {
                style: {
                  width,
                  textAlign: aligment
                },
                className: "content",
                children: [/*#__PURE__*/jsxRuntime.jsx("div", {
                  className: "border border_top"
                }), /*#__PURE__*/jsxRuntime.jsx("div", {
                  className: "border border_left"
                }), /*#__PURE__*/jsxRuntime.jsx("div", {
                  className: "border border_right"
                }), /*#__PURE__*/jsxRuntime.jsx("div", {
                  className: "border border_bottom"
                }), /*#__PURE__*/jsxRuntime.jsx("div", {
                  className: "content",
                  style: {
                    minHeight: "16px"
                  },
                  children: parser(content.replace(/\n/g, ""))
                })]
              }, cell.cellKey);
            })
          }, i))
        })
      }, tableKey), /*#__PURE__*/jsxRuntime.jsx("button", {
        className: "button__edit",
        onClick: handleModalChange,
        children: "Edit"
      })]
    })
  });
}
RenderTable.defaultProps = {
  disabled: false
};

const TablePlugin = (() => {
  return {
    blockRendererFn: (block, props) => {
      if (block?.getData()?.get("dataType") === "table-create") {
        return {
          component: CreateTableComponent,
          props: { ...props,
            block
          }
        };
      }

      if (block?.getData()?.get("dataType") === "table-cel") {
        return {
          component: RenderTable,
          props: { ...props,
            block
          }
        };
      }
    },
    keyBindingFn: (e, props) => {
      const editorState = props.getEditorState();
      const {
        onChange
      } = props.getProps();
      const {
        hasCommandModifier
      } = draftJs.KeyBindingUtil;

      if (!editorState.getCurrentContent().hasText() && ["unstyled", "paragraph"].includes(editorState.getCurrentContent().getFirstBlock().getType())) {

        (async () => {
          const currentStyle = editorState.getCurrentInlineStyle().toArray();
          const styles = lodash.unionWith(currentStyle, props.defaultStyles, (v1, v2) => v1.split(".")[0] === v2.split(".")[0]);
          await onChange(draftJs.EditorState.setInlineStyleOverride(editorState, immutable.OrderedSet(styles)));
        })();
      }

      if (e.keyCode === Keys.B && e.shiftKey && hasCommandModifier(e)) {
        return "bullet_list";
      } else if (e.keyCode === Keys.B && hasCommandModifier(e)) {
        return "BOLD";
      } else if (e.keyCode === Keys.L && e.shiftKey && hasCommandModifier(e)) {
        return "ordered_list";
      } else if (e.keyCode === Keys.L && hasCommandModifier(e)) {
        return "float_left";
      } else if (e.keyCode === Keys.R && hasCommandModifier(e)) {
        return "float_right";
      } else if (e.keyCode === Keys.I && hasCommandModifier(e)) {
        return "ITALIC";
      } else if (e.keyCode === Keys["]"] && hasCommandModifier(e)) {
        return "INDENT";
      } else if (e.keyCode === Keys.U && hasCommandModifier(e)) {
        return "UNDERLINE";
      } else if (e.keyCode === Keys["["] && hasCommandModifier(e)) {
        return "OUTDENT";
      } else if (e.keyCode === Keys.Backspace && !hasCommandModifier(e) && !e.altKey) {
        return "backspace";
      } else if (e.keyCode === Keys.Delete) {
        return "delete";
      } else if (e.keyCode === Keys.Tab && e.shiftKey) {
        const currentBlockType = draftJs.RichUtils.getCurrentBlockType(editorState);

        if (currentBlockType.includes("list-item")) {
          onChange(draftJs.RichUtils.onTab(e, editorState, MAX_LIST_DEPTH));
        } else if (currentBlockType === "table") {
          handleTabInTable("previous", false, editorState, onChange);
        }

        return "shiftTab";
      } else if (e.keyCode === Keys.Tab) {
        const currentBlockType = draftJs.RichUtils.getCurrentBlockType(editorState);

        if (draftJs.RichUtils.getCurrentBlockType(editorState).includes("list-item")) {
          onChange(draftJs.RichUtils.onTab(e, editorState, MAX_LIST_DEPTH));
        } else if (currentBlockType === "table") {
          handleTabInTable("next", false, editorState, onChange);
        } else {
          const newContentState = draftJs.Modifier.replaceText(editorState.getCurrentContent(), editorState.getSelection(), "     ");
          onChange(draftJs.EditorState.push(editorState, newContentState, "insert-characters"));
        }

        return "tab";
      }

      return draftJs.getDefaultKeyBinding(e);
    }
  };
});

const rows = Array(8).fill(1);
const grid = Array(8).fill([...rows]);

const TableGrid = props => {
  const [size, setSize] = React.useState({
    cols: 0,
    rows: 0
  });

  const handleHover = (i, j) => {
    setSize({
      cols: j + 1,
      rows: i + 1
    });
  };

  const handleSelect = () => {
    props.handleSubmit(size);
  };

  const grayCell = {
    border: '1px solid rgba(150, 150, 150, 1)',
    background: 'rgba(200, 200, 200, 0.4)'
  };
  const blueCell = {
    border: '1px solid rgba(0, 125, 250, 0.8)',
    background: 'rgba(0, 125, 250, 0.4)'
  };
  return /*#__PURE__*/jsxRuntime.jsxs("div", {
    children: [/*#__PURE__*/jsxRuntime.jsx("div", {
      style: {
        margin: '10px 10px 5px'
      },
      children: grid.map((row, i) => /*#__PURE__*/jsxRuntime.jsx("div", {
        style: {
          display: 'flex',
          width: 136,
          justifyContent: 'space-between',
          padding: 1,
          cursor: 'pointer'
        },
        children: row.map((cell, j) => {
          const isSelected = i <= size.rows - 1 && j <= size.cols - 1;
          const style = isSelected ? blueCell : grayCell;
          return /*#__PURE__*/jsxRuntime.jsx("div", {
            style: {
              flex: '0 0 15px',
              height: 15,
              ...style
            },
            onMouseEnter: () => handleHover(i, j),
            onClick: handleSelect
          }, `${i}-${j}`);
        })
      }, i))
    }), /*#__PURE__*/jsxRuntime.jsxs("div", {
      css: {
        margin: 10,
        fontSize: 12
      },
      children: ["Insert table size: ", size.cols, " x ", size.rows]
    })]
  });
};

const Button = (props => {
  const state = props.getEditorState();

  const onSelected = size => {
    const {
      cols,
      rows
    } = size;
    let selection = state.getSelection();

    if (!selection.isCollapsed()) {
      return null;
    }

    if (state.getCurrentContent().getBlockForKey(selection.getAnchorKey()).getData()?.get("dataType") === "table-cell") {
      return null;
    }

    const tableKey = draftJs.genKey();
    const data = immutable.Map({
      tableKey,
      aligment: "center",
      cols,
      rows,
      dataType: "table-create"
    });
    const newBlock = new draftJs.ContentBlock({
      key: draftJs.genKey(),
      type: "table",
      text: " ",
      data
    });
    const newBlocks = [];
    newBlocks.push(newBlock);
    const selectionKey = selection.getAnchorKey();
    let contentState = state.getCurrentContent();
    contentState = draftJs.Modifier.splitBlock(contentState, selection);
    const blockArray = contentState.getBlocksAsArray();
    const currBlock = contentState.getBlockForKey(selectionKey);
    const index = blockArray.findIndex(block => block === currBlock);
    const isEnd = index === blockArray.length - 1;

    if (blockArray[index]?.getData()?.get("dataType") === "table-create") {
      newBlocks.unshift(new draftJs.ContentBlock({
        key: draftJs.genKey()
      }));
    }

    if (blockArray[index + 1]?.getData()?.get("dataType") === "table-create") {
      newBlocks.push(new draftJs.ContentBlock({
        key: draftJs.genKey()
      }));
    }

    blockArray.splice(index + 1, 0, ...newBlocks);

    if (isEnd) {
      blockArray.push(new draftJs.ContentBlock({
        key: draftJs.genKey()
      }));
    }

    const entityMap = contentState.getEntityMap();
    contentState = draftJs.ContentState.createFromBlockArray(blockArray, entityMap);
    let newEditorState = draftJs.EditorState.push(state, contentState, "insert-fragment");
    const key = blockArray[0].getKey();
    selection = draftJs.SelectionState.createEmpty(key);
    newEditorState = draftJs.EditorState.acceptSelection(newEditorState, selection);
    props.onChange(newEditorState);
  };

  return /*#__PURE__*/jsxRuntime.jsx(RichEditorDropdown, {
    render: rest => /*#__PURE__*/jsxRuntime.jsx(TableGrid, { ...rest
    }),
    controlWidth: 40,
    dropdownWidth: 160,
    icon: "table-sld",
    method: "tableDropdown",
    activeOption: {
      display: {
        icon: "table-sld"
      }
    },
    editor: props.editor,
    onSelect: onSelected
  }, "insertTable");
});

function iconLibrary() {
  fontawesomeSvgCore.library.add(freeSolidSvgIcons.faAlignCenter, freeSolidSvgIcons.faAlignJustify, freeSolidSvgIcons.faAlignLeft, freeSolidSvgIcons.faAlignRight, freeSolidSvgIcons.faArrowDown, freeSolidSvgIcons.faArrowLeft, freeSolidSvgIcons.faArrowRight, freeSolidSvgIcons.faArrowUp, freeSolidSvgIcons.faBackward, freeSolidSvgIcons.faBars, freeSolidSvgIcons.faBan, freeSolidSvgIcons.faBold, freeSolidSvgIcons.faCheck, freeSolidSvgIcons.faCheckSquare, freeSolidSvgIcons.faChevronDown, freeSolidSvgIcons.faChevronRight, freeSolidSvgIcons.faChevronLeft, freeSolidSvgIcons.faChevronUp, freeSolidSvgIcons.faCloudUploadAlt, freeSolidSvgIcons.faCircle, freeSolidSvgIcons.faCode, freeSolidSvgIcons.faCog, freeSolidSvgIcons.faCompressAlt, freeSolidSvgIcons.faDollarSign, freeSolidSvgIcons.faDownload, freeSolidSvgIcons.faExclamationCircle, freeSolidSvgIcons.faExclamationTriangle, freeSolidSvgIcons.faExpandAlt, freeSolidSvgIcons.faEye, freeSolidSvgIcons.faEyeSlash, freeSolidSvgIcons.faFilter, freeSolidSvgIcons.faFlag, freeSolidSvgIcons.faFont, freeSolidSvgIcons.faForward, freeSolidSvgIcons.faImage, freeSolidSvgIcons.faIndent, freeSolidSvgIcons.faItalic, freeSolidSvgIcons.faLink, freeSolidSvgIcons.faListOl, freeSolidSvgIcons.faListUl, freeSolidSvgIcons.faLock, freeSolidSvgIcons.faLongArrowAltRight, freeSolidSvgIcons.faMapMarkerAlt, freeSolidSvgIcons.faOutdent, freeSolidSvgIcons.faPaintBrush, freeSolidSvgIcons.faParagraph, freeSolidSvgIcons.faPencilAlt, freeSolidSvgIcons.faPrint, freeSolidSvgIcons.faQuestion, freeSolidSvgIcons.faQuoteRight, freeSolidSvgIcons.faSearch, freeSolidSvgIcons.faSearchPlus, freeSolidSvgIcons.faSearchMinus, freeSolidSvgIcons.faSortUp, freeSolidSvgIcons.faSortDown, freeSolidSvgIcons.faSquare, freeSolidSvgIcons.faStepBackward, freeSolidSvgIcons.faStepForward, freeSolidSvgIcons.faStrikethrough, freeSolidSvgIcons.faSyncAlt, freeSolidSvgIcons.faTable, freeSolidSvgIcons.faTint, freeSolidSvgIcons.faTrashAlt, freeSolidSvgIcons.faUnderline, freeSolidSvgIcons.faUser);
}

fontawesomeSvgCore.config.autoAddCss = false;
iconLibrary();
var Wrapper = App;

exports.Button = Button;
exports.TablePlugin = TablePlugin;
exports.Wrapper = Wrapper;
//# sourceMappingURL=bundle.cjs.map
