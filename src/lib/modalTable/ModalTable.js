import {
	EditorState,
	genKey,
	ContentState,
	SelectionState,
	Modifier,
	ContentBlock,
} from "draft-js"
import { useContext, useMemo, useState, useEffect, useCallback } from "react"
import { ModalCtx } from "../../App"
import Cell from "../components/cell/Cell"
import { BLOCK_TYPES, HEADER_TYPES, inlineStylesTypes } from "../constants"

const initialRow = { order: 0, cells: [] }
const initialCell = {
	rowKey: "",
	colKey: "",
	editorState: EditorState.createEmpty(),
}
const tolbarStyleButtons = inlineStylesTypes.map((s) => ({
	name: s.charAt(0),
	className: "toolbar__button",
	dataStyle: s,
}))

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
	const [cell, setCell] = useState(modal.cell || null)
	const [active, setActive] = useState("")
	const [styleKey, setStyleKey] = useState({
		event: "",
		eventState: [],
	})
	const [headerKey, setHeaderKey] = useState({})
	const [selectGroup, setSelectGroup] = useState([])
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
	}

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

	const handleSelect = ({ target }) => {
		if (!active) {
			return null
		}
		const selectedMap = {
			row,
			col,
		}
		const type = target.getAttribute("data-object")
		const neededKey = type === "col" ? "colKey" : "rowKey"

		const key = cell[active][neededKey]

		const selectedItems = Object.keys(cell).filter(
			(e) => key === cell[e][neededKey]
		)
		setSelectGroup(selectedItems)
	}

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
				</ul>
			</div>
			<div className="table__wrapper">
				<EditTableWrapper
					setSelectGroup={setSelectGroup}
					selectGroup={selectGroup}
					col={col}
					row={row}
					cell={cell}
				>
					{({ clicking, enterHandler }) => (
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
											clicking={clicking}
											enterHandler={enterHandler}
										/>
									))}
								</tr>
							))}
						</tbody>
					)}
				</EditTableWrapper>
			</div>
			<button onClick={handleSave}>save</button>
			<button onClick={handleCol} data-value={0}>
				add Col before
			</button>
			<button onClick={handleCol} data-value={1}>
				add Col after
			</button>
			<div>
				<button onClick={handleSelect} data-object="col">
					select Col
				</button>
				<button onClick={handleSelect} data-object="row">
					select Row
				</button>
			</div>
		</div>
	)
}

function EditTableWrapper({ children, setSelectGroup, col, row, cell,selectGroup }) {
	const [clicking, setClicking] = useState(false)

	const colMap = createIndexes(col)
	const rowMap = createIndexes(row)

	const eventEnter = (e) => {
		const key = e.currentTarget.dataset.key
		const currentCell = cell[key]
		const { rowKey, colKey } = currentCell

		const curColIndex = colMap[colKey]
		const curRowIndex = rowMap[rowKey]

		const correctCols = Object.keys(colMap).filter(
			(c) => colMap[c] <= curColIndex
		)
		const correctRows = Object.keys(rowMap).filter(
			(r) => rowMap[r] <= curRowIndex
		)

		const result = Object.keys(cell).filter((c) => {
			const rKey = cell[c].rowKey
			const cKey = cell[c].colKey

			return correctCols.includes(cKey) && correctRows.includes(rKey)
		})

		setSelectGroup(result)
	}

	const handleMouseDown = (e) => {
		if(e.button===0){
			setClicking(true)
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

	return (
		<table
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseOver}
			onMouseLeave={handleMouseOver}
			onKeyUp={handleKeyUp}
		>
			{children({ enterHandler: eventEnter, clicking })}
		</table>
	)
}
