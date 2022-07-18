import React from "react"
import {
	EditorState,
	KeyBindingUtil,
	Modifier,
	RichUtils,
	getDefaultKeyBinding,
} from "draft-js"
import { unionWith } from "lodash"
import { OrderedSet } from "immutable"
import { Keys,  MAX_LIST_DEPTH } from "../lib/constants"
import { handleTabInTable } from "./utils"
import CreateTableComponent from "../lib/Table"
import RenderTable from "../lib/RenderTable"

export default () => {
	return {
		blockRendererFn: (block, props) => {
      // console.log(block.getType(),'TYPES');
			if (block?.getData()?.get("dataType") === "table-create") {
				return {
					component: CreateTableComponent,
					props: { ...props, block },
				}
			}
			if (block?.getData()?.get("dataType") === "table-cel") {
				return {
					component: RenderTable,
					props: { ...props, block },
				}
			}
		}
	}
}
