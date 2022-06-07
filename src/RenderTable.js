import React, { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
	EditorBlock,
	EditorState,
	genKey,
	ContentBlock,
	Modifier,
	SelectionState,
} from "draft-js"
import { defaultPreTagStyling } from "./constants"
import { camelCase, isNil } from "lodash"
import { Map, OrderedSet } from "immutable"
import DataGrid from "react-data-grid"
import Cell from "./components/cell/Cell"

export default function RenderTable(props) {
	const editor = props.blockProps.getEditorRef()
	const editorState = props.blockProps.getEditorState()
	const { onChange } = props.blockProps.getProps()
	const { block } = props
	const { grid, disabled } = props

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
		syncContenteditable(disabled)
	}, [disabled])

	if (
		block.getData().get("tablePosition") &&
		!block.getData().get("arrayMap")
	) {
		const position = block.getData().get("tablePosition")
		const target = editor?.editor.querySelector(`[data-position='${position}']`)
		// console.log(position, "TARGET")
		if (target) {
			console.log(block.getText(), "TEXT")

			return createPortal(<EditorBlock {...props}><Cell /></EditorBlock>, target)
		}
		return null
	}
	const tableKey = block.getKey()
	const data = block.getData().get("dataTable")
	console.log(data)

	// if(grid){
	//     return <DataGrid columns={cols} rows={rows}/>
	// }
	return (
		<table key={tableKey} id={tableKey} border={1}>
			<tbody>
				{data.map((row, i) => (
					<tr key={i}>
						{row.map((cell, j) => {
							return (
								<td
									key={j}
									data-position={`${tableKey}-${i}-${j}`}
									style={{ width: "200px" }}
								>
									 <Cell />
								</td>
							)
						})}
					</tr>
				))}
			</tbody>
		</table>
	)
}

RenderTable.defaultProps = {
	disabled: false,
	grid: false,
}
