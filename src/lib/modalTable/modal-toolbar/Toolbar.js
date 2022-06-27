import React from "react"
import RichEditorDropdown from "../../components/toolbar/richEditorDropdown"
import { availableAlignments, dropdownOptions } from "../../constants"
import Content from "./content/Content"

const Toolbar = ({
	setAligment,
	alignment,
	selectGroup,
	setGroupAligment,
}) => {
	const name = "alignment"

	const handleSelect = (type) => {
        if(selectGroup.length){
            return setGroupAligment(type)
        }
		return setAligment(type)
	}
	const controlProps = {
		activeOption: dropdownOptions[name].activeOption(alignment?alignment: 'justify'),
		controlWidth: dropdownOptions[name].controlWidth,
		dropdownWidth: dropdownOptions[name].dropdownWidth,
		key: name,
		list: availableAlignments,
		onSelect: handleSelect,
	}
	return (
		<RichEditorDropdown
			render={(props) => <Content {...props} />}
			{...controlProps}
		/>
	)
}

export default Toolbar
