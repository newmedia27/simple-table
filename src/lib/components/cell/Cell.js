import React, { useRef, useEffect, useCallback, useMemo } from "react"
import { Editor, RichUtils } from "draft-js"
import { getSelectionInlineStyle } from "draftjs-utils"
import "draft-js/dist/Draft.css"
import classNames from "classnames"
import Resizeble from "../resizeble/Resizeble"
import "./Cell.sass"

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
	cellStyle,
	setColStyle,
	colKey,
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

	const handleBlur = (e) => {
		// if (active === cellKey) {
		// 	setActive("")
		// } TODO:
	}

	const handleMouseMove = (e) => {
		if (clicking) {
			enterHandler(e)
		}
	}

	return (
		<td
			className={classNames("Content", {
				'active': activeGroup,
			})}
			onFocus={handleFocus}
			onBlur={handleBlur}
			tabIndex={index}
			data-key={cellKey}
			onMouseEnter={handleMouseMove}
			style={{ textAlign: aligment, ...cellStyle }}
		>
			<Resizeble
				setColStyle={setColStyle}
				colWidth={cellStyle && cellStyle.width}
				colKey={colKey}
			/>
			<div className="ContentEditor">
				<Editor
          ref={ref}
          editorState={editorState}
          onChange={handleChange}
        />
			</div>
		</td>
	)
}


