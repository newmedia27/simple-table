import React, { useRef, useEffect, useCallback, useMemo } from "react"
import Editor from "@draft-js-plugins/editor"
import { RichUtils } from "draft-js"
import { getSelectionInlineStyle } from "draftjs-utils"
import "draft-js/dist/Draft.css"
import classNames from "classnames"
import Resizeble from "../resizeble/Resizeble"

export default function Cell({
	editorState,
	cellKey,
	onChange,
	index,
	active,
	setActive,
	styleKey,
	headerKey,
	selectGroup,
	clicking,
	enterHandler,
	aligment,
	setSelectGroup,
}) {
	const ref = useRef(null)
	const { eventState, event } = styleKey
	const activeGroup = useMemo(
		() => selectGroup?.includes(cellKey),
		[selectGroup]
	)
	const changeStyles = useCallback(
		(state) => {
			const styles = getSelectionInlineStyle(state)
			const appliedStyles = Object.keys(styles).filter((e) => styles[e])
			const difference = appliedStyles
				.filter((x) => !eventState.includes(x))
				.concat(eventState.filter((x) => !appliedStyles.includes(x)))
			let addStyleState = state
			if (difference.length) {
				difference.forEach((e) => {
					addStyleState = RichUtils.toggleInlineStyle(state, e)
				})
			}
			return addStyleState
		},
		[eventState]
	)

	const handleChange = (state) => {
		const addStyleState = changeStyles(state)
		onChange((s) => ({
			...s,
			[cellKey]: { ...s[cellKey], editorState: addStyleState },
		}))
	}
	useEffect(() => {
		if (eventState && event) {
			const addStyleState = changeStyles(editorState)
			// console.log(event, "STYLE")
			onChange((s) => ({
				...s,
				[cellKey]: {
					...s[cellKey],
					editorState: addStyleState,
				},
			}))
		}
	}, [eventState])

	useEffect(() => {
		if (active === cellKey) {
			const state = RichUtils.toggleBlockType(editorState, headerKey[cellKey])
			onChange((s) => ({
				...s,
				[cellKey]: {
					...s[cellKey],
					editorState: state,
				},
			}))
		}
	}, [headerKey])

	if (!editorState) {
		return null
	}

	const handleFocus = () => {
		ref.current.editor.focus()
		setActive(cellKey)
		if (!activeGroup) {
			setSelectGroup([])
		}
	}
	const handleMouseMove = (e) => {
		if (clicking) {
			enterHandler(e)
		}
	}
	console.log("active :>> ", aligment)
	return (
		<td
			className={classNames("content", {
				active: activeGroup,
			})}
			onFocus={handleFocus}
			tabIndex={index}
			data-key={cellKey}
			onMouseEnter={handleMouseMove}
			style={{ textAlign: aligment }}
		>
			<Resizeble />
			<div className="content">
				<Editor ref={ref} editorState={editorState} onChange={handleChange} />
			</div>
		</td>
	)
}
