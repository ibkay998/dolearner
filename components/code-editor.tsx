"use client"

import { useRef } from "react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef(null)

  function handleEditorDidMount(editor) {
    editorRef.current = editor
  }

  return (
    <div className="h-[500px] w-full">
      <Editor
        height="100%"
        defaultLanguage="jsx"
        value={value}
        theme="vs-dark"
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          readOnly,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}

