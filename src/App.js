import React, {
	createContext,
	useRef,
	useState,
	useContext,
	useEffect,
	useMemo,
} from "react"

import { DraftailEditor, BLOCK_TYPE, INLINE_STYLE } from "draftail"
import Button from "./lib/components/Button"
import TablePlugin from "./plugin/TablePlugin"
import Cell from "./lib/components/cell/Cell"
import { createPortal } from "react-dom"
import {
	ContentState,
	EditorState,
	ContentBlock,
	genKey,
	Editor,
	SelectionState,
	Modifier,
} from "draft-js"
import { BLOCK_TYPES, HEADER_TYPES, inlineStylesTypes } from "./lib/constants"
import Modal from "./lib/components/modal"

export const ModalCtx = createContext()

const initialModal = {
	isOpen: false,
	defaultSchema: null,
	editorState: null,
	generalEditorState: null,
	tableKey: "",
	tableSchema: null,
}

export default function App() {
	const editor = useRef(null)
	const [modal, setModal] = useState(initialModal)

	return (
		<ModalCtx.Provider
			value={{
				modal,
				handleModal: setModal,
				handleEditor: Editor.onChange,
			}}
		>
			<div className="Editor__wrapper">
				<DraftailEditor
					ref={editor}
					rawContentState={null}
					blockTypes={[
						{ type: BLOCK_TYPE.HEADER_THREE },
						{ type: BLOCK_TYPE.UNORDERED_LIST_ITEM },
					]}
					inlineStyles={[
						{ type: INLINE_STYLE.BOLD },
						{ type: INLINE_STYLE.ITALIC },
					]}
					controls={[(props) => <Button editor={editor} {...props} />]}
					plugins={[TablePlugin()]}
				/>
			</div>

			<Modal
				isOpen={modal.isOpen}
				onClose={() => {
					setModal((s) => ({
						...s,
						isOpen: false,
					}))
				}}
			>
				{(close) => <ModalTable closeModal={close} />}
			</Modal>
		</ModalCtx.Provider>
	)
}

const initialRow = { order: 0, cells: [] }
const initialCell = {
	order: 0,
	rowKey: "",
	editorState: EditorState.createEmpty(),
}
const tolbarStyleButtons = inlineStylesTypes.map((s) => ({
	name: s.charAt(0),
	className: "toolbar__button",
	dataStyle: s,
}))

const blockTypes = [...HEADER_TYPES, ...BLOCK_TYPES]

function ModalTable({ closeModal }) {
	const modalCtx = useContext(ModalCtx)
	const { modal } = modalCtx
	const [row, setRow] = useState(modal.row || null)
	const [cell, setCell] = useState(modal.cell || null)
	const [active, setActive] = useState("")
	const [styleKey, setStyleKey] = useState({
		event: "",
		eventState: [],
	})
	const [headerKey, setHeaderKey] = useState({})
	const { defaultSchema } = modal

	function createState() {
		const rowObject = {}
		const cellObject = {}
		defaultSchema.forEach((r, i) => {
			const rowKey = genKey()
			rowObject[rowKey] = { ...initialRow, order: i }
			r.forEach((c, j) => {
				const cellKey = genKey()
				cellObject[cellKey] = {
					...initialCell,
					rowKey,
					order: j,
					row: i,
					cellKey,
				}
				rowObject[rowKey].cells.push(cellKey)
			})
		})
		setRow(rowObject)
		setCell(cellObject)
	}

	useEffect(() => {
		if (modal.isOpen && defaultSchema && !modal.tableSchema) {
			createState()
		}
	}, [modal])

	const renderSchema = useMemo(() => {
		if (!row || !cell) {
			return []
		}

		const rows = Object.keys(row)
			.map((e) => {
				return Object.keys(cell)
					.filter((c) => cell[c].rowKey === e)
					.sort(function (a, b) {
						if (a.order > b.order) {
							return 1
						}
						if (a.order < b.order) {
							return -1
						}
						return 0
					})
			})
			.sort(function (a, b) {
				if (a.order > b.order) {
					return 1
				}
				if (a.order < b.order) {
					return -1
				}
				return 0
			})
		return rows
	}, [row, cell])

	function handleSave() {
		const getSchema = renderSchema

		const prepareSchema = getSchema.map((r) =>
			r.map((c) => {
				const contentState = cell[c].editorState.getCurrentContent()
				cell[c]["contentState"] = contentState
				return cell[c]
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
		const newBlock = new ContentBlock({
			key: genKey(),
			type: "table",
			text: " ",
			data: newData,
		})

		blockArray.splice(index, 1, newBlock)

		const entityMap = contentState.getEntityMap()
		contentState = ContentState.createFromBlockArray(blockArray, entityMap)
		console.log(blockArray, "CONTENT", modal.tableKey)
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
		console.log(row, "ROW")
		console.log(cell, "COL")
		const type = currentTarget.getAttribute("data-value")
		console.log(type)
		let rows = Object.keys(row)
			.map((e) => {
				return Object.keys(cell)
					.filter((c) => cell[c].rowKey === e)
					.sort(function (a, b) {
						if (a.order > b.order) {
							return 1
						}
						if (a.order < b.order) {
							return -1
						}
						return 0
					})
					.map((k) => cell[k])
			})
			.sort(function (a, b) {
				if (a.order > b.order) {
					return 1
				}
				if (a.order < b.order) {
					return -1
				}
				return 0
			})
		if (active) {
			const { order } = cell[active]
			rows.forEach((e) => {
				const curIndex = e.findIndex((c) => c.order === order)
				const updateIndex = curIndex + +type
				const rowKey = e[0].rowKey
				e.splice(updateIndex, 0, { ...initialCell, rowKey, cellKey: genKey() })
				console.log(curIndex, "INDEX", updateIndex)
			})
		} else {
			rows.forEach((e) => {
				const rowKey = e[0].rowKey
				e.push({ ...initialCell, rowKey, cellKey: genKey() })
			})
		}

		const rowState = {}
		const cellState = {}

		rows.forEach((r, i) => {
			r.forEach((c, j) => {
				if (!rowState[c.rowKey]) {
					rowState[c.rowKey] = []
				}
				rowState[c.rowKey].push(c.cellKey)
				cellState[c.cellKey] = { ...c, row: i, order: j }
			})
		})

		setRow(rowState)
		setCell(cellState)
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
				<table>
					<tbody>
						{renderSchema.map((row, j) => (
							<tr key={j}>
								{row.map((cel, i) => (
									<Cell
										key={cel}
										index={i}
										cellKey={cel}
										{...cell[cel]}
										onChange={setCell}
										setActive={setActive}
										styleKey={styleKey}
										headerKey={headerKey}
										active={active}
									/>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<button onClick={handleSave}>save</button>
			<button onClick={handleCol} data-value={0}>
				add Col before
			</button>
			<button onClick={handleCol} data-value={1}>
				add Col after
			</button>
		</div>
	)
}
