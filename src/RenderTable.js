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
            console.log(block.getText(),'TEXT');

			return createPortal(<EditorBlock {...props} />, target)
		}
		return null
	}

	const data = block.getData()
	const tableKey = data.get("tableKey")
	const arrayMap = data.get("arrayMap")
	let cols = [
		// { key: "id", name: "" },
		// { key: "title", name: "" },
	]

	let rows = [
		// { id: 0, title: "titile" },
		// { id: 1, title: "Demo" },
		// bfcau-0-1
	]

	arrayMap.forEach((e, i) => {
		if (cols.length < e.length) {
			cols = e
		}
		const obj = {}
		e.forEach((cel, j) => {
			obj[cel.key] = (
				<div
					style={{ width: "100%", height: "100px" }}
					data-position={`${tableKey}-${i}-${j}`}
				>
					{!!((i === 0) & (j === 0)) && <Cell />}
				</div>
			)
		})
		rows.push(obj)
	})
    console.log(rows,'ROWS');
    if(grid){
        return <DataGrid columns={cols} rows={rows}/>
    }
	return (
		<table key={tableKey} id={tableKey} border={1}>
			<tbody>
				{arrayMap.map((row, i) => (
					<tr key={i}>
						{row.map((cell, j) => {
							return (
								<td
									key={j}
									data-position={`${tableKey}-${i}-${j}`}
									style={{ width: "200px" }}
								>
									{!!((i === 0) & (j === 0)) && <EditorBlock {...props} />}
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
