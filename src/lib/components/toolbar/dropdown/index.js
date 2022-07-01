import React, { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import Icon from "../icon"
import DropdownWrapper from "./DropdownWrapper"

const Dropdown = ({ orientation, open, top, children, className }) => {
	const ref = useRef()
	const [scrollDiff, setScrollDiff] = useState(0)
	const [scrollBottom, setScrollBottom] = useState(false)

	const handleScrolling = () => {
		if (
			ref.current.scrollTop + ref.current.clientHeight ===
			ref.current.scrollHeight
		) {
			setScrollBottom(true)
		} else {
			setScrollBottom(false)
		}
	}

	useEffect(() => {
		if (open && ref.current) {
			setScrollDiff(ref.current.scrollHeight - ref.current.clientHeight)
		} else if (!open) {
			setScrollDiff(0)
			setScrollBottom(false)
		}
	}, [open])

	return (
		(open || null) && (
			<DropdownWrapper
				className={`dropdown ${className ?? ""} ${orientation === "left" ? 'left' : 'right'}`}
				styles={{ top }}
			>
				<div
					ref={ref}
					className="dropdown-content"
					style={
						scrollDiff <= 18 && {
							maxHeight: `${ref.current?.scrollHeight}px !important`,
						}
					}
					onScroll={handleScrolling}
				>
					{children}
				</div>
				{scrollDiff > 18 && (
					<div
						style={
							{
								fontSize: "12px",
								paddingLeft: 6,
								background: "#ffcf8f",
								color: "#333",
								borderBottomRightRadius: 3,
								borderBottomLeftRadius: 3,
								transition: "opacity 200ms ease-in-out",
								opacity: scrollBottom && 0.2
							}
						}
					>
						scroll for more <Icon name="arrow-down-sld" />
					</div>
				)}
			</DropdownWrapper>
		)
	)
}

Dropdown.componentDescription = "Generic dropdown menu."
Dropdown.componentKey = "dropdown"
Dropdown.componentName = "Dropdown menu"

Dropdown.propTypes = {
	/** Boolean whether to show or not */
	open: PropTypes.bool,
	/** Left or right aligned. Options are "left" or "right". */
	orientation: PropTypes.oneOf(["left", "right"]),
	/** Distance from top positioned absolute. */
	top: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

Dropdown.defaultProps = {
	orientation: "right",
	top: "50px",
}

export default Dropdown
