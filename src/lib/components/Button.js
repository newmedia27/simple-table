import TableGrid from "./toolbar/tableGrid"
import Dropdown from "./toolbar/richEditorDropdown"
import {
	genKey,
	ContentBlock,
	Modifier,
	SelectionState,
	EditorState,
	ContentState,
} from "draft-js"
import { Map } from "immutable"

export default (props) => {
	const state = props.getEditorState()
	const onSelected = (size) => {
		const { cols, rows } = size

		let selection = state.getSelection()
		if (!selection.isCollapsed()) {
			return null
		}

		// don't insert a table within a table
		if (
			state
				.getCurrentContent()
				.getBlockForKey(selection.getAnchorKey())
				.getData()
				?.get("dataType") === "table-cell"
		) {
			return null
		}
		const tableKey = genKey()
		const data = Map({
			tableKey,
			aligment: "center",
			cols,
			rows,
			dataType: "table-create",
		})
		const newBlock = new ContentBlock({
			key: genKey(),
			type: "table",
			text: " ",
			data,
		})
		const newBlocks = []
		newBlocks.push(newBlock)
		const selectionKey = selection.getAnchorKey()
		let contentState = state.getCurrentContent()
		contentState = Modifier.splitBlock(contentState, selection)
		const blockArray = contentState.getBlocksAsArray()
		const currBlock = contentState.getBlockForKey(selectionKey)
		const index = blockArray.findIndex((block) => block === currBlock)
		const isEnd = index === blockArray.length - 1

		if (blockArray[index]?.getData()?.get("dataType") === "table-create") {
			newBlocks.unshift(new ContentBlock({ key: genKey() }))
		}
		if (blockArray[index + 1]?.getData()?.get("dataType") === "table-create") {
			newBlocks.push(new ContentBlock({ key: genKey() }))
		}
		blockArray.splice(index + 1, 0, ...newBlocks)
		if (isEnd) {
			blockArray.push(new ContentBlock({ key: genKey() }))
		}

		const entityMap = contentState.getEntityMap()
		contentState = ContentState.createFromBlockArray(blockArray, entityMap)
		let newEditorState = EditorState.push(
			state,
			contentState,
			"insert-fragment"
		)
		const key = blockArray[0].getKey()

		selection = SelectionState.createEmpty(key)
		newEditorState = EditorState.acceptSelection(newEditorState, selection)
		props.onChange(newEditorState)
	}
	return (
		<Dropdown
			render={(rest) => <TableGrid {...rest} />}
			controlWidth={40}
			dropdownWidth={160}
			icon={"table-sld"}
			method={"tableDropdown"}
			activeOption={{ display: { icon: "table-sld" } }}
			editor={props.editor}
			onSelect={onSelected}
			key={"insertTable"}
		/>
	)
}
