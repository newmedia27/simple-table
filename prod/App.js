import React, { createContext,  useState } from "react"

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

export default function App({ children }) {
	const [modal, setModal] = useState(initialModal)

	return (
		<ModalCtx.Provider
			value={{
				modal,
				handleModal: setModal,
				handleEditor: Editor.onChange,
			}}
		>
			{children}
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
