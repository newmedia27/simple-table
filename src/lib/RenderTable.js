import React, { useContext, useEffect, useState } from "react"
import { ModalCtx } from "../App"
import { stateToHTML } from "draft-js-export-html"
import { getStateToHtmlOptions } from "./renderConfig"
import parser from "html-react-parser"

export default function RenderTable(props) {
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
	const aligment = data.get('aligment')

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
			aligment
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

	return (
		<>
			<div className="wrapper">
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
									if (!cell.contentState) {
										return (
											<td
												key={j}
												data-position={`${tableKey}-${i}-${j}`}
												style={{ width: "200px" }}
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
									const aligment = cell?.aligment || 'center'
									return (
										<td
											key={cell.cellKey}
											style={{ width: "200px", textAlign: aligment }}
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
				<button className="button" onClick={handleModalChange}>
					Edit
				</button>
			</div>
		</>
	)
}

RenderTable.defaultProps = {
	disabled: false,
}
