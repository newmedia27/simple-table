import React, { useEffect, useRef, useState } from "react"
import "./resizeble.sass"
const Resizeble = ({ colStyle, setColStyle, wrapperRef, colKey }) => {
	const [start, setStart] = useState({})
	const ref = useRef(null)
	let startX, startY, startWidth
	const handleMouseDown = (e) => {
		initDrag(e)
	}
	function doDrag(e) {
		const width = startWidth + e.clientX - startX + "px"
		setColStyle((s) => ({
			...s,
			[colKey]: { ...s[colKey], width },
		}))
		console.log(width, "WIDTH")
	}

	function stopDrag(e) {
		document.documentElement.removeEventListener("mousemove", doDrag, false)
		document.documentElement.removeEventListener("mouseup", stopDrag, false)
	}
	function initDrag(e) {
		startX = e.clientX
		startY = e.clientY
		startWidth = parseInt(wrapperRef.clientWidth, 10)
		document.documentElement.addEventListener("mousemove", doDrag, false)
		document.documentElement.addEventListener("mouseup", stopDrag, false)
	}

	return (
		<>
			<div className="border border_top" />
			<div
				ref={ref}
				onMouseDown={handleMouseDown}
				className="border border_right"
			/>
			<div className="border border_left" />
			<div className="border border_bottom" />
		</>
	)
}

export default Resizeble

// var p = document.querySelector('p'); // element to make resizable

// p.addEventListener('click', function init() {
//     p.removeEventListener('click', init, false);
//     p.className = p.className + ' resizable';
//     var resizer = document.createElement('div');
//     resizer.className = 'resizer';
//     p.appendChild(resizer);
//     resizer.addEventListener('mousedown', initDrag, false);
// }, false);

// var startX, startY, startWidth, startHeight;

// function initDrag(e) {
//    startX = e.clientX;
//    startY = e.clientY;
//    startWidth = parseInt(document.defaultView.getComputedStyle(p).width, 10);
//    startHeight = parseInt(document.defaultView.getComputedStyle(p).height, 10);
//    document.documentElement.addEventListener('mousemove', doDrag, false);
//    document.documentElement.addEventListener('mouseup', stopDrag, false);
// }

// function doDrag(e) {
//    p.style.width = (startWidth + e.clientX - startX) + 'px';
//    p.style.height = (startHeight + e.clientY - startY) + 'px';
// }

// function stopDrag(e) {
//     document.documentElement.removeEventListener('mousemove', doDrag, false);
//     document.documentElement.removeEventListener('mouseup', stopDrag, false);
// }
