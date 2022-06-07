import React from "react"
import {
	EditorState,
	KeyBindingUtil,
	Modifier,
	RichUtils,
	getDefaultKeyBinding,
} from "draft-js"
import { debounce, isArray, isNil, unionWith, kebabCase } from "lodash"
import { Map, OrderedSet } from "immutable"
import TableWrapper from "../table/Table"
import Table from "../Table"
import RenderTable from "../RenderTable"
import { Keys, MAX_INDENT_DEPTH, MAX_LIST_DEPTH } from "./constants"
import { handleTabInTable } from "./utils"

export default () => {
	return {
		blockRendererFn: (block, props) => {
      console.log(block.getType(),'BLOCK');

			if (block?.getData()?.get("dataType") === "table-create") {
				return {
					component: Table,
					props: { ...props, block },
				}
			}
			if (block?.getData()?.get("dataType") === "table") {
				return {
					component: RenderTable,
					props: { ...props, block },
				}
			}
		},
	
	}
}
