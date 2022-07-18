import React, { useEffect, useRef, useState } from "react"
import "./resizeble.sass"

const Resizeble = ({ colStyle, setColStyle, colWidth, colKey }) => {
	const [start, setStart] = useState(null)
	const ref = useRef(null)

	const handleMouseDown = (e) => {
		initDrag(e)
	}

	function doDrag(e) {
		const width = start.startWidth + e.clientX - start.startX
		setColStyle((s) => ({
			...s,
			[colKey]: { ...s[colKey], width },
		}))
	}

	function stopDrag(e) {
		document.documentElement.removeEventListener("mousemove", doDrag, false)
		document.documentElement.removeEventListener("mouseup", stopDrag, false)
	}
	function initDrag(e) {
		const startX = e.clientX
		setStart({
			startX,
			startWidth: colWidth,
		})
	}

	useEffect(() => {
		if (start) {
			document.documentElement.addEventListener("mousemove", doDrag, false)
			document.documentElement.addEventListener("mouseup", stopDrag, false)
		}
	}, [start])

  return (
		<>
			<div className="Border Border_top" />
			<div
				ref={ref}
				onMouseDown={handleMouseDown}
				className="Border Border_right"
			/>
			<div className="Border Border_left" />
			<div className="Border Border_bottom" />
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
