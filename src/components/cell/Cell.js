import React, { Component } from "react"
import Editor from "@draft-js-plugins/editor"
import { EditorState } from "draft-js"

export default class Cell extends Component {
	state = {
		editorState: EditorState.createEmpty(),
	}
	ref = React.createRef(null)
	onChange = (editorState) => {
		this.setState({
			editorState,
		})
	}

    componentDidMount(){
        if(this.ref.current){
            this.ref.current.addEventListener('copy',e=>{
                console.log(e,'COPY');
            })
            this.ref.current.addEventListener('cut',e=>{
                console.log(e,'CUT');
            })
        }
    }

	render() {
		return (
			<div ref={this.ref} style={{ border: "1px solid red" }}>
				<Editor editorState={this.state.editorState} onChange={this.onChange} />
			</div>
		)
	}
}
