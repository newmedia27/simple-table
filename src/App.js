import React, { useRef, useState } from "react"

import { DraftailEditor, BLOCK_TYPE, INLINE_STYLE } from "draftail"
import Button from "./Button"
import TablePlugin from "./plugin/TablePlugin"
import {
	serialiseEditorStateToRaw,
	createEditorStateFromRaw,
} from "draftjs-conductor"
import { convertToRaw } from "draft-js"
import { RichUtils } from "draft-js"
import { EditorState } from "draft-js"
import { Modifier } from "draft-js"
import { SelectionState } from "draft-js"
import { Editor } from "draft-js"
import Cell from "./components/cell/Cell"

export default function App() {
	const editor = useRef(null)
 console.log(EditorState);
  const removeSizeDataFromBlock = (newEditorState, block) => {
   

		const data = block
			.getData()
			.delete("height")
			.delete("width")
			.delete("imgStyle")
		block = block.set("data", data)
		let contentState = newEditorState.getCurrentContent()
		let blockMap = contentState.getBlockMap()
		blockMap = blockMap.set(block.getKey(), block)
		contentState = contentState.set("blockMap", blockMap)
		newEditorState = EditorState.push(
			newEditorState,
			contentState,
			"change-block-data"
		)
		return newEditorState
	}
  // const handleKeyCommand = (command, newEditorState) => {
	// 	switch (command) {
	// 		case "backspace": {
	// 			// removing images ("atomic" blocktype) with backspace requires special handling or the image tag and dataUrl can be left in the content but not visible.
	// 			let contentState = newEditorState.getCurrentContent()
	// 			let selectionState = newEditorState.getSelection()
	// 			const startKey = selectionState.getStartKey()
	// 			const offset = selectionState.getStartOffset()
	// 			const collapsed = selectionState.isCollapsed()
	// 			const blockBefore = contentState.getBlockBefore(startKey)
	// 			const currentBlockType = RichUtils.getCurrentBlockType(newEditorState)
	// 			if (
	// 				collapsed &&
	// 				offset === 0 &&
	// 				blockBefore &&
	// 				blockBefore.getType() === "atomic"
	// 			) {
	// 				newEditorState = removeSizeDataFromBlock(newEditorState, blockBefore)
	// 				newEditorState = EditorState.acceptSelection(
	// 					newEditorState,
	// 					selectionState
	// 				)
	// 				onChange(RichUtils.onBackspace(newEditorState))
	// 				return "handled"
	// 			} else if (currentBlockType === "atomic") {
	// 				const currentBlock = contentState.getBlockForKey(startKey)
	// 				newEditorState = removeSizeDataFromBlock(newEditorState, currentBlock)
	// 				newEditorState = EditorState.acceptSelection(
	// 					newEditorState,
	// 					selectionState
	// 				)
	// 				newEditorState = RichUtils.onBackspace(newEditorState)
	// 				contentState = newEditorState.getCurrentContent()
	// 				selectionState = newEditorState.getSelection()
	// 				const key = selectionState.getAnchorKey()
	// 				let selection = SelectionState.createEmpty(key)
	// 				selection = selection.set("focusOffset", 1)
	// 				contentState = Modifier.removeRange(
	// 					contentState,
	// 					selection,
	// 					"backward"
	// 				)
	// 				onChange(
	// 					EditorState.push(
	// 						newEditorState,
	// 						contentState,
	// 						"backspace-character"
	// 					)
	// 				)
	// 				return "handled"
	// 			} else if (currentBlockType === "table" && collapsed && offset === 0) {
	// 				return "handled"
	// 			} else if (
	// 				currentBlockType !== "table" &&
	// 				collapsed &&
	// 				blockBefore?.getType() === "table" &&
	// 				offset === 0
	// 			) {
	// 				handleTabInTable("previous", true)
	// 				return "handled"
	// 			} else if (
	// 				collapsed &&
	// 				offset === 0 &&
	// 				blockBefore?.getType() === "page-break"
	// 			) {
	// 				let selection = SelectionState.createEmpty(blockBefore.getKey())
	// 				contentState = Modifier.setBlockData(contentState, selection, Map({}))
	// 				contentState = Modifier.setBlockType(
	// 					contentState,
	// 					selection,
	// 					"unstyled"
	// 				)
	// 				selection = selection.merge({
	// 					focusKey: selectionState.getFocusKey(),
	// 					focusOffset: 0,
	// 					hasFocus: true,
	// 				})
	// 				contentState = Modifier.removeRange(
	// 					contentState,
	// 					selection,
	// 					"backward"
	// 				)
	// 				onChange(
	// 					EditorState.push(newEditorState, contentState, "remove-range")
	// 				)
	// 				return "handled"
	// 			} else if (currentBlockType === "page-break") {
	// 				contentState = Modifier.setBlockData(
	// 					contentState,
	// 					selectionState,
	// 					Map({})
	// 				)
	// 				contentState = Modifier.setBlockType(
	// 					contentState,
	// 					selectionState,
	// 					"unstyled"
	// 				)
	// 				let selection = selectionState
	// 				if (collapsed && contentState.getBlockAfter(startKey)) {
	// 					selection = selection.merge({
	// 						focusKey: contentState.getBlockAfter(startKey).getKey(),
	// 						focusOffset: 0,
	// 						hasFocus: true,
	// 					})
	// 				}
	// 				contentState = Modifier.removeRange(
	// 					contentState,
	// 					selection,
	// 					"backward"
	// 				)
	// 				onChange(
	// 					EditorState.push(newEditorState, contentState, "remove-range")
	// 				)
	// 				return "handled"
	// 			} else if (
	// 				collapsed &&
	// 				offset === 0 &&
	// 				[
	// 					"pasted-list-item",
	// 					"ordered-list-item",
	// 					"unordered-list-item",
	// 				].includes(currentBlockType)
	// 			) {
	// 				contentState = Modifier.setBlockType(
	// 					contentState,
	// 					selectionState,
	// 					"unstyled"
	// 				)
	// 				onChange(
	// 					EditorState.push(newEditorState, contentState, "change-block-type")
	// 				)
	// 				return "handled"
	// 			} else if (!collapsed) {
	// 				return handleKeypressWhenSelectionNotCollapsed(newEditorState)
	// 			} else {
	// 				return "not-handled"
	// 			}
	// 		}
	// 		case "delete":
	// 			return handleDeleteKey()
	// 		case "shiftTab":
	// 			return "handled"
	// 		case "tab":
	// 			return "handled"
	// 		default:
	// 			return "not-handled"
	// 	}
	// }
  const handleReturn = (e, editorState) => {    
      console.log(e,'EEE');
		if (e.shiftKey) {
			const newEditorState = RichUtils.insertSoftNewline(editorState)
			const contentState = Modifier.replaceText(
				newEditorState.getCurrentContent(),
				newEditorState.getSelection(),
				" "
			)
			Editor.onChange(
				EditorState.push(newEditorState, contentState, "insert-characters")
			)
			return "handled"
		} else if (RichUtils.getCurrentBlockType(editorState) === "table") {
      Editor.onChange(RichUtils.insertSoftNewline(editorState))
			return "handled"
		} else if (
			RichUtils.getCurrentBlockType(editorState) === "pasted-list-item" &&
			editorState.getSelection().isCollapsed()
		) {
			let content = editorState.getCurrentContent()
			let selection = editorState.getSelection()
			let currentBlock = content.getBlockForKey(selection.getAnchorKey())
			content = Modifier.splitBlock(content, selection)
			let newEditorState = EditorState.push(
				editorState,
				content,
				selection,
				"split-block"
			)
			let nextBlock = content.getBlockAfter(selection.getAnchorKey())
			const key = nextBlock.getKey()
			while (nextBlock?.getType() === "pasted-list-item") {
				let data = currentBlock.getData()
				data = data.merge({
					listStart: +data.get("listStart") > 0 ? data.get("listStart") + 1 : 0,
				})
				content = Modifier.setBlockData(
					newEditorState.getCurrentContent(),
					SelectionState.createEmpty(nextBlock.getKey()),
					data
				)
				newEditorState = EditorState.push(
					newEditorState,
					content,
					"change-block-data"
				)
				currentBlock = content.getBlockForKey(nextBlock.getKey())
				nextBlock = content.getBlockAfter(nextBlock.getKey())
			}
			selection = selection.merge({
				anchorKey: key,
				focusKey: key,
				anchorOffset: 0,
				focusOffset: 0,
				hasFocus: true,
			})
			newEditorState = EditorState.forceSelection(newEditorState, selection)
      Editor.onChange(newEditorState)
			return "handled"
		}
		return "not-handled"
	}
	return (
    <>
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
      // handleKeyCommand={props=>{console.log(props,'KEYS')}}
      handleReturn={(e, editorState) => handleReturn(e, editorState)}
		/>
    {/* <Cell/> */}
    </>
	
	)
}
