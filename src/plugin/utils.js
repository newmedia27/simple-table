import { EditorState } from "draft-js"
import { RichUtils } from "draft-js"
import { SelectionState } from "draft-js"
import { Modifier } from "draft-js"
import { handleKeyCommand } from "draft-js/lib/RichTextEditorUtil"

export const handleTabInTable = (
	direction = "next",
	collapsed = false,
	editorState,
	onChange = () => {}
) => {
	let newEditorState = editorState
	let selection = editorState.getSelection()
	let contentState = editorState.getCurrentContent()
	let targetKey = selection.getAnchorKey()
	let targetBlock = contentState.getBlockForKey(targetKey)
	do {
		if (direction === "next") {
			targetBlock = contentState.getBlockAfter(targetKey)
		} else {
			targetBlock = contentState.getBlockBefore(targetKey)
		}
		targetKey = targetBlock && targetBlock.getKey()
	} while (
		targetKey &&
		["atomic", "horizontal-rule"].includes(targetBlock.getType())
	)
	if (!targetBlock && direction === "next") {
		selection = selection.merge({
			anchorOffset: contentState
				.getBlockForKey(selection.getAnchorKey())
				.getLength(),
			focusOffset: contentState
				.getBlockForKey(selection.getAnchorKey())
				.getLength(),
		})
		contentState = Modifier.splitBlock(contentState, selection)
		targetBlock = contentState.getLastBlock()
		selection = SelectionState.createEmpty(targetBlock.getKey())
		contentState = Modifier.setBlockType(contentState, selection, "unstyled")
		targetBlock = contentState.getLastBlock()
		newEditorState = EditorState.push(editorState, contentState, "split-block")
	} else if (!targetBlock) {
		targetBlock = contentState.getBlockForKey(selection.getAnchorKey())
	}
	const isTargetTable =
		targetBlock.getData()?.get("dataType") === "table-cel" && !collapsed
	const endOffset = targetBlock.getLength()
	selection = SelectionState.createEmpty(targetBlock.getKey())
	selection = selection.merge({
		anchorOffset: isTargetTable || direction === "next" ? 0 : endOffset,
		focusOffset: isTargetTable || direction === "previous" ? endOffset : 0,
	})
	onChange(EditorState.forceSelection(newEditorState, selection))
}

export const handleKeysCommand = (command, newEditorState) => {
	switch (command) {
		case "backspace": {
			// removing images ("atomic" blocktype) with backspace requires special handling or the image tag and dataUrl can be left in the content but not visible.
			let contentState = newEditorState.getCurrentContent()
			let selectionState = newEditorState.getSelection()
			const startKey = selectionState.getStartKey()
			const offset = selectionState.getStartOffset()
			const collapsed = selectionState.isCollapsed()
			const blockBefore = contentState.getBlockBefore(startKey)
			const currentBlockType = RichUtils.getCurrentBlockType(newEditorState)
			const selection = newEditorState.getSelection()
			const selectionKey = selection.getAnchorKey()
			const currBlock = contentState.getBlockForKey(selectionKey)
			const data = currBlock.getData()
			if (data.get("dataType") === "table-cel" && collapsed && offset === 0) {
				return "handled"
			} else if (
				data.get("dataType") !== "table-cel" &&
				collapsed &&
				blockBefore?.getData().get("dataType") === "table-cel" &&
				offset === 0
			) {
				handleTabInTable("previous", true)
				return "handled"
			} else if (
				collapsed &&
				offset === 0 &&
				blockBefore?.getType() === "page-break"
			) {
				let selection = SelectionState.createEmpty(blockBefore.getKey())
				contentState = Modifier.setBlockData(contentState, selection, Map({}))
				contentState = Modifier.setBlockType(
					contentState,
					selection,
					"unstyled"
				)
				selection = selection.merge({
					focusKey: selectionState.getFocusKey(),
					focusOffset: 0,
					hasFocus: true,
				})
				contentState = Modifier.removeRange(contentState, selection, "backward")
				// onChange(EditorState.push(newEditorState, contentState, "remove-range"))
				return "handled"
			} 
    //         else if (currentBlockType === "page-break") {
	// 			contentState = Modifier.setBlockData(
	// 				contentState,
	// 				selectionState,
	// 				Map({})
	// 			)
	// 			contentState = Modifier.setBlockType(
	// 				contentState,
	// 				selectionState,
	// 				"unstyled"
	// 			)
	// 			let selection = selectionState
	// 			if (collapsed && contentState.getBlockAfter(startKey)) {
	// 				selection = selection.merge({
	// 					focusKey: contentState.getBlockAfter(startKey).getKey(),
	// 					focusOffset: 0,
	// 					hasFocus: true,
	// 				})
	// 			}
	// 			contentState = Modifier.removeRange(contentState, selection, "backward")
	// 			onChange(EditorState.push(newEditorState, contentState, "remove-range"))
	// 			return "handled"
	// 		} else if (
	// 			collapsed &&
	// 			offset === 0 &&
	// 			[
	// 				"pasted-list-item",
	// 				"ordered-list-item",
	// 				"unordered-list-item",
	// 			].includes(currentBlockType)
	// 		) {
	// 			contentState = Modifier.setBlockType(
	// 				contentState,
	// 				selectionState,
	// 				"unstyled"
	// 			)
	// 			onChange(
	// 				EditorState.push(newEditorState, contentState, "change-block-type")
	// 			)
	// 			return "handled"
	// 		} else if (!collapsed) {
	// 			return handleKeypressWhenSelectionNotCollapsed(newEditorState)
	// 		} else {
	// 			return "not-handled"
	// 		}
		}
	// 	case "BOLD":
	// 		toggleInlineStyle("BOLD")
	// 		return "handled"
	// 	case "bullet_list":
	// 		toggleListType("BULLETLIST")
	// 		return "handled"
	// 	case "delete":
	// 		return handleDeleteKey()
	// 	case "float_left":
	// 		toggleBlockData({ float: "left" })
	// 		return "handled"
	// 	case "float_right":
	// 		toggleBlockData({ float: "right" })
	// 		return "handled"
	// 	case "INDENT":
	// 		setIndent("INDENT")
	// 		return "handled"
	// 	case "ITALIC":
	// 		toggleInlineStyle("ITALIC")
	// 		return "handled"
	// 	case "ordered_list":
	// 		toggleListType("ORDEREDLIST")
	// 		return "handled"
	// 	case "OUTDENT":
	// 		setIndent("OUTDENT")
	// 		return "handled"
	// 	case "UNDERLINE":
	// 		toggleInlineStyle("UNDERLINE")
	// 		return "handled"
	// 	case "shiftTab":
	// 		return "handled"
	// 	case "tab":
	// 		return "handled"
		default:
			return "not-handled"
	}
}
