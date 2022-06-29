import {
	EditorState,
	genKey,
	ContentState,
	SelectionState,
	Modifier,
	ContentBlock,
} from "draft-js"
import {
	useContext,
	useMemo,
	useState,
	useEffect,
	useRef,
	Children,
	cloneElement,
} from "react"
import { ModalCtx } from "../../App"
import Cell from "../components/cell/Cell"
import { BLOCK_TYPES, HEADER_TYPES, inlineStylesTypes } from "../constants"
import Toolbar from "./modal-toolbar/Toolbar"
import "./table.sass"

const initialCell = {
	rowKey: "",
	colKey: "",
	editorState: EditorState.createEmpty(),
	aligment: "left",
}
const tolbarStyleButtons = inlineStylesTypes.map((s) => ({
	name: s.charAt(0),
	className: "toolbar__button",
	dataStyle: s,
}))

const initCellStyle = {
	minWidth: 50,
	width: 200,
}

const blockTypes = [...HEADER_TYPES, ...BLOCK_TYPES]

const createIndexes = (arr) => {
	if (!arr) return null
	return arr.reduce((acc, c, i) => {
		acc[c] = i
		return acc
	}, {})
}

export default function ModalTable({ closeModal }) {
	const modalCtx = useContext(ModalCtx)
	const { modal } = modalCtx
	const [row, setRow] = useState(modal.row || null)
	const [col, setCol] = useState(modal.col || null)
	const [colStyle, setColStyle] = useState(modal.colStyle || null)
	const [cell, setCell] = useState(modal.cell || null)
	const [active, setActive] = useState("")
	const [styleKey, setStyleKey] = useState({
		event: "",
		eventState: [],
	})
	const [headerKey, setHeaderKey] = useState({})
	const [selectGroup, setSelectGroup] = useState([])
	const [aligment, setAligment] = useState("")
	const [groupAligment, setGroupAligment] = useState("")
	const { defaultSchema } = modal

	function createState() {
		const rowArr = []
		const cellObject = {}
		const colArr = []
		let colKey = null

		defaultSchema.forEach((r, i) => {
			const rowKey = genKey()
			rowArr.push(rowKey)
			r.forEach((c, j) => {
				if (i === 0) {
					colKey = genKey()
					colArr.push(colKey)
				}
				const cellKey = genKey()
				cellObject[cellKey] = {
					...initialCell,
					rowKey,
					cellKey,
					colKey: colArr[j],
					aligment,
				}
			})
		})
		setRow(rowArr)
		setCell(cellObject)
		setCol(colArr)
	}

	useEffect(() => {
		if (modal.isOpen && defaultSchema && !modal.tableSchema) {
			createState()
		}
	}, [modal])

	const renderSchema = useMemo(() => {
		if (!row || !cell || !col) {
			return []
		}
		const colIndexMap = createIndexes(col)
		const rowIndexMap = createIndexes(row)
		return Object.keys(cell).reduce((acc, c) => {
			const { rowKey, colKey } = cell[c]
			acc[rowIndexMap[rowKey]] = acc[rowIndexMap[rowKey]] ?? []
			acc[rowIndexMap[rowKey]][colIndexMap[colKey]] = cell[c]
			return acc
		}, [])
	}, [row, cell, col])

	function handleSave() {
		const getSchema = renderSchema

		const prepareSchema = getSchema.map((r) =>
			r.map((c) => {
				const contentState = c.editorState.getCurrentContent()
				c["contentState"] = contentState
				return c
			})
		)
		const { generalEditorState } = modal
		let contentState = generalEditorState.getCurrentContent()
		let selection = generalEditorState.getSelection()
		contentState = Modifier.splitBlock(contentState, selection)
		const blockArray = contentState.getBlocksAsArray()
		const currBlock = blockArray.find(
			(e) => e.getData().get("tableKey") === modal.tableKey
		)
		const index = blockArray.findIndex((block) => block === currBlock)
		const data = currBlock.getData()
		const newData = data
			.set("tableSchema", prepareSchema)
			.set("row", row)
			.set("cell", cell)
			.set("col", col)
			.set("colStyle", colStyle)
		const newBlock = new ContentBlock({
			key: genKey(),
			type: "table",
			text: " ",
			data: newData,
		})

		blockArray.splice(index, 1, newBlock)

		const entityMap = contentState.getEntityMap()
		contentState = ContentState.createFromBlockArray(blockArray, entityMap)
		let newEditorState = EditorState.push(
			generalEditorState,
			contentState,
			"insert-fragment"
		)
		const key = blockArray[0].getKey()
		selection = SelectionState.createEmpty(key)
		newEditorState = EditorState.acceptSelection(newEditorState, selection)
		modal.onChange(newEditorState)
		closeModal()
	}

	useEffect(() => {
		setCell((s) => {
			if (!aligment && !groupAligment) {
				return s
			}
			if (active) {
				return { ...s, [active]: { ...s[active], aligment } }
			}
			return Object.keys(s).reduce((acc, c) => {
				acc[c] = { ...s[c], aligment }
				return acc
			}, {})
		})
	}, [aligment])

	useEffect(() => {
		setCell((s) => {
			const group = selectGroup.reduce((acc, c) => {
				acc[c] = { ...s[c], aligment: groupAligment }
				return acc
			}, {})
			return { ...s, ...group }
		})
	}, [groupAligment])

	if (!modal.isOpen) {
		return null
	}

	function handleToolbar(e) {
		e.preventDefault()
		const style = e.target.getAttribute("data-style")
		setStyleKey((s) => {
			const styleInArray = s.eventState.includes(style)
			let state = []
			if (styleInArray) {
				state = s.eventState.filter((k) => k !== style)
			} else {
				state = [...s.eventState, style]
			}
			return {
				...s,
				event: style,
				eventState: state,
			}
		})
	}
	const handleHeaderTypes = (e) => {
		e.preventDefault()
		const style = e.target.getAttribute("data-style")
		if (active) {
			setHeaderKey((s) => {
				if (!s[active]) {
					s[active] = {}
				}
				if (s[active] === style) {
					return { ...s, [active]: "" }
				}
				return { ...s, [active]: style }
			})
		}
	}
	console.log(colStyle && colStyle, "ACTIVE")
	return (
		<div className="table__wrapper">
			<div className="toolbar__wrapper">
				<ul className="toolbar">
					{tolbarStyleButtons.map((e) => (
						<li key={e.dataStyle}>
							<button
								data-style={e.dataStyle}
								data-active={styleKey.eventState.some((k) => k === e.dataStyle)}
								className={e.className}
								onMouseDown={handleToolbar}
							>
								{e.name}
							</button>
						</li>
					))}
					<ul className="toolbar">
						{blockTypes.map((e) => (
							<li key={e.label}>
								<button
									onMouseDown={handleHeaderTypes}
									data-style={e.style}
									data-active={
										headerKey[active] && headerKey[active] === e.style
									}
									className="toolbar__button"
								>
									{e.label}
								</button>
							</li>
						))}
					</ul>
					<Toolbar
						setAligment={setAligment}
						alignment={aligment}
						groupAligment={groupAligment}
						setGroupAligment={setGroupAligment}
						selectGroup={selectGroup}
					/>
				</ul>
			</div>
			<EditTableWrapper
				setSelectGroup={setSelectGroup}
				selectGroup={selectGroup}
				col={col}
				row={row}
				cell={cell}
				active={active}
				setCol={setCol}
				setCell={setCell}
				colStyle={colStyle}
				setColStyle={setColStyle}
			>
				{({ clicking, enterHandler }) => (
					<>
						<tbody>
							{renderSchema.map((row, j) => (
								<tr key={j}>
									{row.map((cell, i) => (
										<Cell
											key={cell.cellKey}
											index={i}
											{...cell}
											onChange={setCell}
											setActive={setActive}
											styleKey={styleKey}
											headerKey={headerKey}
											active={active}
											selectGroup={selectGroup}
											setSelectGroup={setSelectGroup}
											clicking={clicking}
											enterHandler={enterHandler}
											setColStyle={setColStyle}
											cellStyle={colStyle && colStyle[cell.colKey]}
										/>
									))}
								</tr>
							))}
						</tbody>
					</>
				)}
			</EditTableWrapper>
			<button onClick={handleSave}>save</button>
		</div>
	)
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
	colStyle,
}) {
	const ref = useRef(null)
	const [clicking, setClicking] = useState(false)
	const [contextMenu, setContextMenu] = useState({
		isOpen: false,
		target: null,
	})
	const colMap = createIndexes(col)
	const rowMap = createIndexes(row)

	const eventEnter = (e) => {
		const key = e.currentTarget.dataset.key
		const currentCell = cell[key]
		const { rowKey, colKey } = currentCell

		const curColIndex = colMap[colKey]
		const startColIndex = colMap[cell[active].colKey]
		const startRowIndex = rowMap[cell[active].rowKey]
		const curRowIndex = rowMap[rowKey]

		const correctCols = Object.keys(colMap).filter((c) => {
			if (curColIndex >= startColIndex) {
				return colMap[c] <= curColIndex && colMap[c] >= startColIndex
			}
			return colMap[c] >= curColIndex && colMap[c] <= startColIndex
		})
		const correctRows = Object.keys(rowMap).filter((r) => {
			if (curRowIndex >= startRowIndex) {
				return rowMap[r] <= curRowIndex && rowMap[r] >= startRowIndex
			}
			return rowMap[r] >= curRowIndex && rowMap[r] <= startRowIndex
		})

		const result = Object.keys(cell).filter((c) => {
			const rKey = cell[c].rowKey
			const cKey = cell[c].colKey

			return correctCols.includes(cKey) && correctRows.includes(rKey)
		})

		setSelectGroup(result)
	}

	const handleMouseDown = (e) => {
		if (e.button === 0) {
			return setClicking(true)
		}
	}
	const handleMouseOver = (e) => {
		setClicking(false)
	}

	const handleKeyUp = (e) => {
		if (e.which === 27 && selectGroup.length) {
			e.preventDefault()
			e.stopPropagation()
			setSelectGroup([])
		}
	}

	const handleContext = (e) => {
		e.preventDefault()
		setContextMenu({ isOpen: true, target: e.currentTarget, event: e })
	}
	function handleCol({ currentTarget }) {
		const type = currentTarget.getAttribute("data-value")
		const colArr = [...col]
		const needItems = row.length
		const newColKey = genKey()
		const insertObject = {}
		for (let i = 0; i < needItems; i++) {
			const cellKey = genKey()
			insertObject[cellKey] = {
				...initialCell,
				rowKey: row[i],
				colKey: newColKey,
				cellKey,
			}
		}

		if (active) {
			const { colKey } = cell[active]
			const curIndex = col.findIndex((e) => e === colKey)
			const updateIndex = curIndex + +type
			colArr.splice(updateIndex, 0, newColKey)
		} else {
			colArr.push(newColKey)
		}
		setCol(colArr)
		setCell((s) => ({
			...s,
			...insertObject,
		}))
		setContextMenu((s) => ({ ...s, isOpen: false }))
	}
	const handleSelect = ({ target }) => {
		if (!active) {
			return null
		}

		const type = target.getAttribute("data-object")
		const neededKey = type === "col" ? "colKey" : "rowKey"

		const key = cell[active][neededKey]

		const selectedItems = Object.keys(cell).filter(
			(e) => key === cell[e][neededKey]
		)
		setSelectGroup(selectedItems)
		setContextMenu((s) => ({ ...s, isOpen: false }))
	}

	useEffect(() => {
		if (ref.current && !colStyle && col) {
			const tableWidth = ref.current.clientWidth
			const cellWidth = tableWidth / col.length
			const resizeState = col.reduce((acc, e) => {
				if (!acc[e]) {
					acc[e] = {}
				}
				acc[e] = { ...initCellStyle, width: cellWidth }
				return acc
			}, {})
			setColStyle(resizeState)
		}
	}, [ref.current, colStyle, col])

	// const setAlignmentInTable = (alignment, content, blocks) => {
	// 	// because cell style data is kept in the tableShape array stored with
	// 	// the first block in the table, we have to update that information here
	// 	let blockMap = content.getBlockMap()
	// 	const tableKey = blocks.first().getData().get("tableKey")
	// 	let firstTableBlock = blockMap.find(
	// 		(block) => block.getData().get("tablePosition") === `${tableKey}-0-0`
	// 	)
	// 	const tableShape = firstTableBlock.getData().get("tableShape")
	// 	blocks.forEach((block) => {
	// 		const [_, row, col] = block.getData().get("tablePosition").split("-")
	// 		tableShape[row][col].style = {
	// 			...tableShape[row][col].style,
	// 			"text-align": alignment,
	// 		}
	// 	})
	// 	let data = firstTableBlock.getData()
	// 	data = data.set("tableShape", tableShape)
	// 	firstTableBlock = firstTableBlock.merge({ data })
	// 	blockMap = blockMap.merge([[firstTableBlock.getKey(), firstTableBlock]])
	// 	content = content.merge({ blockMap })
	// 	return content
	// }
	return (
		<div className="table__wrapper" ref={ref}>
			<table
				className="table table__edit"
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseOver}
				onMouseLeave={handleMouseOver}
				onKeyUp={handleKeyUp}
				onContextMenu={handleContext}
			>
				{children({ enterHandler: eventEnter, clicking })}
			</table>
			<TableCtxMenu contextMenu={contextMenu} changeMenu={setContextMenu}>
				<button onClick={handleCol} data-value={0}>
					add col before
				</button>
				<button onClick={handleCol} data-value={1}>
					add col after
				</button>
				<button onClick={handleSelect} data-object="col">
					select col
				</button>
				<button onClick={handleSelect} data-object="row">
					select row
				</button>
			</TableCtxMenu>
		</div>
	)
}

function getPosition(e) {
	let posx = 0
	let posy = 0

	if (!e) e = window.event

	if (e.pageX || e.pageY) {
		posx = e.pageX
		posy = e.pageY
	} else if (e.clientX || e.clientY) {
		posx =
			e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
		posy =
			e.clientY + document.body.scrollTop + document.documentElement.scrollTop
	}

	return {
		x: posx,
		y: posy,
	}
}

function TableCtxMenu({ contextMenu, changeMenu, children }) {
	const { isOpen, target, event } = contextMenu
	const [style, setStyle] = useState({})
	const ref = useRef(null)

	const childrenArray = Children.toArray(children)
	useEffect(() => {
		const { x, y } = getPosition(event)
		if (ref.current) {
			const w = ref.current.clientWidth
			const { width } = target.getBoundingClientRect()
			let left = x - 50
			if (width - left < w) {
				left = width - w
			}

			setStyle({ top: y - 50, left })
		}
	}, [event])

	if (!isOpen) {
		return null
	}
	return (
		<>
			<ul ref={ref} className="context__menu" style={style}>
				{childrenArray.map((e, i) => {
					return (
						<li key={i}>{cloneElement(e, { className: "context__item" })}</li>
					)
				})}
			</ul>
			<span
				className="context__overlay"
				onClick={() => {
					changeMenu({ isOpen: false, target: false })
				}}
			/>
		</>
	)
}
