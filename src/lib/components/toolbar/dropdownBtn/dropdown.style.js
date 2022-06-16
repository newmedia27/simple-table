import styled from "@emotion/styled"
import style from "../richEditorDropdown/dropdown.style"

export default styled.div`
	position: relative;
	display: inline;
	${(props) => style(props.styles).styles}
`
