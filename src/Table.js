import { convertToRaw, ContentBlock, genKey, ContentState } from "draft-js"
import { Map } from "immutable"
import { createEditorStateFromRaw } from "draftjs-conductor"
import { useEffect } from "react"


const cols = [
    { key: 'id', name: 'ID' },
    { key: 'title', name: 'Title' }
  ];

  const rows = [
    { id: 0, title: 'titile' },
    { id: 1, title: 'Demo' }
  ];



export default function Table(props) {
	function createTable() {
		const { blockProps, contentState } = props
		const { blocks } = convertToRaw(contentState)
		const index = blocks.findIndex((e) => e?.data?.dataType === "table-create")
		const { onChange } = blockProps.getProps()
		const createrBlock = blocks[index]
		const { data } = createrBlock
		const { rows, cols, tableKey } = data
		const colArr = Array(cols).fill(1).map(e=>({key: genKey()}))
		const rowArr = Array(rows).fill(colArr)
		const newBlocks = []
		rowArr.forEach((row, i) => {
			row.forEach((cel, j) => {
				let data = Map({
					tableKey,
					tablePosition: `${tableKey}-${i}-${j}`,
					"text-align": "center",
					col: j,
					row: i,
					dataType: "table-cel",
				})

				if (i === 0 && j === 0) {
					data = data.set("arrayMap", rowArr)
				}

				newBlocks.push(
					new ContentBlock({
						key: genKey(),
						type: "table",
						text:  `${tableKey}-${i}-${j}`,
						data,
					})
				)
			})
		})
		const prepareBlocks = [...contentState.getBlocksAsArray()]
        console.log(prepareBlocks,'BLOCK');
		prepareBlocks.splice(index, 1, ...newBlocks)

		const entityMap = contentState.getEntityMap()
		const newState = ContentState.createFromBlockArray(prepareBlocks, entityMap)
		const editorState = createEditorStateFromRaw(convertToRaw(newState))
		onChange(editorState)
	}

	useEffect(() => {
		createTable()
	}, [])
	
	return null
}
