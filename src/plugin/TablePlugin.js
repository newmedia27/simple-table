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
			if (block?.getData()?.get("dataType") === "table-create") {
				return {
					component: Table,
					props: { ...props, block },
				}
			}
			if (block?.getData()?.get("dataType") === "table-cel") {
				return {
					component: RenderTable,
					props: { ...props, block },
				}
			}
		},
		keyBindingFn: (e, props) => {
			const editorState = props.getEditorState()
			const { onChange } = props.getProps()
			const { hasCommandModifier } = KeyBindingUtil
			if (
				!editorState.getCurrentContent().hasText() &&
				["unstyled", "paragraph"].includes(
					editorState.getCurrentContent().getFirstBlock().getType()
				)
			) {
				;(async () => {
					const currentStyle = editorState.getCurrentInlineStyle().toArray()
					// merge user selected styles with defaults, overriding defaults where they conflict
					const styles = unionWith(
						currentStyle,
						props.defaultStyles,
						(v1, v2) => v1.split(".")[0] === v2.split(".")[0]
					)
					await onChange(
						EditorState.setInlineStyleOverride(editorState, OrderedSet(styles))
					)
				})()
			}
			if (e.keyCode === Keys.B && e.shiftKey && hasCommandModifier(e)) {
				return "bullet_list"
			} else if (e.keyCode === Keys.B && hasCommandModifier(e)) {
				return "BOLD"
			} else if (e.keyCode === Keys.L && e.shiftKey && hasCommandModifier(e)) {
				return "ordered_list"
			} else if (e.keyCode === Keys.L && hasCommandModifier(e)) {
				return "float_left"
			} else if (e.keyCode === Keys.R && hasCommandModifier(e)) {
				return "float_right"
			} else if (e.keyCode === Keys.I && hasCommandModifier(e)) {
				return "ITALIC"
			} else if (e.keyCode === Keys["]"] && hasCommandModifier(e)) {
				return "INDENT"
			} else if (e.keyCode === Keys.U && hasCommandModifier(e)) {
				return "UNDERLINE"
			} else if (e.keyCode === Keys["["] && hasCommandModifier(e)) {
				return "OUTDENT"
			} else if (
				e.keyCode === Keys.Backspace &&
				!hasCommandModifier(e) &&
				!e.altKey
			) {
				return "backspace"
				// Tab & shift+Tab handled here instead of handleKeyCommand because RichUtils.onTab requires event reference
			} else if (e.keyCode === Keys.Delete) {
				return "delete"
			} else if (e.keyCode === Keys.Tab && e.shiftKey) {
				const currentBlockType = RichUtils.getCurrentBlockType(editorState)
				if (currentBlockType.includes("list-item")) {
					onChange(RichUtils.onTab(e, editorState, MAX_LIST_DEPTH))
				} else if (currentBlockType === "table") {
					handleTabInTable("previous", false, editorState, onChange)
				}
				return "shiftTab"
			} else if (e.keyCode === Keys.Tab) {
				const currentBlockType = RichUtils.getCurrentBlockType(editorState)
				if (RichUtils.getCurrentBlockType(editorState).includes("list-item")) {
					onChange(RichUtils.onTab(e, editorState, MAX_LIST_DEPTH))
				} else if (currentBlockType === "table") {
					handleTabInTable("next", false, editorState, onChange)
				} else {
					const newContentState = Modifier.replaceText(
						editorState.getCurrentContent(),
						editorState.getSelection(),
						"     "
					)
					onChange(
						EditorState.push(editorState, newContentState, "insert-characters")
					)
				}
				return "tab"
			}
			return getDefaultKeyBinding(e)
		},
	}
}
