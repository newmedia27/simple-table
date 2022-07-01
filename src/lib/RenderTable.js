import React, { useContext, useEffect, useRef, useState } from "react"
import { ModalCtx } from "../App"
import { stateToHTML } from "draft-js-export-html"
import { getStateToHtmlOptions } from "./renderConfig"
import parser from "html-react-parser"

export default function RenderTable(props) {
	const [initialCellWidth, setInitialCellWidt] = useState(200)
	const wrapperRef = useRef(null)
	const editor = props.blockProps.getEditorRef()
	const editorState = props.blockProps.getEditorState()
	const { onChange } = props.blockProps.getProps()
	const { block } = props
	const data = block.getData()
	const tableKey = data.get("tableKey")
	const defaultSchema = data.get("defaultSchema")
	const tableSchema = data.get("tableSchema")
	const row = data.get("row")
	const cell = data.get("cell")
	const col = data.get("col")
	const aligment = data.get("aligment")
	const colStyle = data.get("colStyle")

	const schema = tableSchema || defaultSchema

	const modalCtx = useContext(ModalCtx)

	function handleModalChange() {
		modalCtx.handleModal((s) => ({
			...s,
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
			colStyle,
		}))
	}

	const syncContenteditable = (disabled) => {
		if (disabled) {
			const editableDivs =
				editor.current?.editor.querySelectorAll('[contenteditable="true"]') ??
				[]
			editableDivs.forEach((div) => {
				div.setAttribute("contenteditable", "false")
				div.setAttribute("data-editable-disabled", "true")
			})
		} else if (!disabled) {
			const editableDivs =
				editor.current?.editor.querySelectorAll(
					'[data-editable-disabled="true"]'
				) ?? []
			editableDivs.forEach((div) => {
				div.setAttribute("contenteditable", "true")
				div.removeAttribute("data-editable-disabled")
			})
		}
	}
	useEffect(() => {
		syncContenteditable(props.disabled)
	}, [props.disabled])

	useEffect(() => {
		if (wrapperRef.current && schema[0]?.length) {
			setInitialCellWidt(wrapperRef?.current.clientWidth /  schema[0]?.length)
		}
	}, [wrapperRef, schema])

	return (
		<>
			<div className="wrapper" ref={wrapperRef}>
				<table
					key={tableKey}
					id={tableKey}
					border={1}
					className="RenderTableWrapper"
				>
					<tbody>
						{schema.map((row, i) => (
							<tr key={i}>
								{row.map((cell, j) => {
									const width = colStyle && colStyle[cell.colKey]?.width
									if (!cell.contentState) {
										return (
											<td
												key={j}
												data-position={`${tableKey}-${i}-${j}`}
												style={{ width: initialCellWidth }}
											>
												<div
													className="content"
													style={{ minHeight: "16px" }}
												/>
											</td>
										)
									}
									const options = getStateToHtmlOptions(cell.contentState)
									const content = stateToHTML(cell.contentState, options)
									const aligment = cell?.aligment || "center"
									return (
										<td
											key={cell.cellKey}
											style={{ width, textAlign: aligment }}
											className="content"
										>
											<div className="border border_top" />
											<div className="border border_left" />
											<div className="border border_right" />
											<div className="border border_bottom" />
											<div className="content" style={{ minHeight: "16px" }}>
												{parser(content.replace(/\n/g, ""))}
											</div>
										</td>
									)
								})}
							</tr>
						))}
					</tbody>
				</table>
				<button className="button__edit" onClick={handleModalChange}>
					Edit
				</button>
			</div>
		</>
	)
}

RenderTable.defaultProps = {
	disabled: false,
}
