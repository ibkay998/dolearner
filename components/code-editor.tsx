"use client"

import { useRef, useEffect, useState } from "react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef(null)
  const [editorKey, setEditorKey] = useState(Date.now())

  // Force re-mount of editor when value changes significantly
  useEffect(() => {
    setEditorKey(Date.now())
  }, [readOnly])

  function handleEditorDidMount(editor) {
    editorRef.current = editor
  }

  // Ensure changes are propagated immediately
  function handleEditorChange(newValue) {
    if (onChange) {
      onChange(newValue || '')
    }
  }

  return (
    <div className="h-[500px] w-full">
      <Editor
        key={editorKey}
        height="100%"
        defaultLanguage="jsx"
        value={value}
        theme="vs-dark"
        onChange={handleEditorChange}
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

