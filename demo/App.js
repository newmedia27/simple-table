import React, { createContext, useRef, useState } from "react"

import { DraftailEditor, BLOCK_TYPE, INLINE_STYLE } from "draftail"
import Button from "./lib/components/Button"
import TablePlugin from "./plugin/TablePlugin"
import { Editor } from "draft-js"
import Modal from "./lib/components/modal"
import ModalTable from "./lib/modalTable/ModalTable"

export const ModalCtx = createContext()

const initialModal = {
	isOpen: false,
	defaultSchema: null,
	editorState: null,
	generalEditorState: null,
	tableKey: "",
	tableSchema: null,
}

export default function App() {
	const editor = useRef(null)
	const [modal, setModal] = useState(initialModal)

	return (
		<ModalCtx.Provider
			value={{
				modal,
				handleModal: setModal,
				handleEditor: Editor.onChange,
			}}
		>
			<div className="Editor__wrapper">
				<DraftailEditor
					ref={editor}
					rawContentState={null}
					blockTypes={[
						{ type: BLOCK_TYPE.HEADER_THREE },
						{ type: BLOCK_TYPE.UNORDERED_LIST_ITEM },
					]}
					inlineStyles={[
						{ type: INLINE_STYLE.BOLD },
						{ type: INLINE_STYLE.ITALIC },
					]}
					controls={[(props) => <Button editor={editor} {...props} />]}
					plugins={[TablePlugin()]}
				/>
			</div>

			<Modal
				isOpen={modal.isOpen}
				onClose={() => {
					setModal((s) => ({
						...s,
						isOpen: false,
					}))
				}}
			>
				{(close) => <ModalTable closeModal={close} />}
			</Modal>
		</ModalCtx.Provider>
	)
}
