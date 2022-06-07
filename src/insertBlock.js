import { AtomicBlockUtils,EditorState } from "draft-js";

insertBlock = (editorState,type, data) => {
    const contentState = editorState.getCurrentContent(); 
    const contentStateWithEntity = contentState.createEntity(type, 'IMMUTABLE', data);

    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newEditorState = EditorState.set(
      editorState,
      {currentContent: contentStateWithEntity},
    );

    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '),
    });
  }