"use client"

import { useState, useEffect } from "react"
import { transform } from "@babel/standalone"

export function Preview({ code }: { code: string }) {
  const [error, setError] = useState<string | null>(null)
  const [compiledCode, setCompiledCode] = useState("")

  useEffect(() => {
    try {
      // Add necessary imports and wrapper for the user's code
      const wrappedCode = `
        ${code}

        const PreviewComponent = () => {
          try {
            if (typeof Component !== 'function') {
              throw new Error('Component is not defined or is not a function');
            }
            return React.createElement(Component);
          } catch (error) {
            return React.createElement('div', {
              style: { color: 'red', padding: '1rem' }
            }, 'Error: ' + error.message);
          }
        };
      `

      // Transform JSX to JS
      const { code: transformedCode } = transform(wrappedCode, {
        presets: ["react"],
        filename: 'component.jsx',
        sourceType: "module",
        ast: false,
        retainLines: true,
      })

      setCompiledCode(transformedCode || '')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [code])

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded">
        <h3 className="font-bold">Compilation Error:</h3>
        <pre className="mt-2 text-sm overflow-auto">{error}</pre>
      </div>
    )
  }

  return (
    <div className="preview-container">
      <iframe
        title="preview"
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                .preview-container {
                  padding: 1rem;
                }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script>
                const root = ReactDOM.createRoot(document.getElementById('root'));

                function ErrorBoundary({ children }) {
                  if (!children) {
                    return null;
                  }
                  try {
                    return children;
                  } catch (error) {
                    return React.createElement('div', {
                      style: { color: 'red', padding: '1rem' }
                    }, 'Error: ' + error.message);
                  }
                }

                try {
                  // Inject the transformed code here
                  ${compiledCode}

                  root.render(
                    React.createElement(ErrorBoundary, null,
                      React.createElement(PreviewComponent)
                    )
                  );
                } catch (error) {
                  root.render(
                    React.createElement('div', {
                      style: { color: 'red', padding: '1rem' }
                    }, 'Error: ' + error.message)
                  );
                }
              </script>
            </body>
          </html>
        `}
        className="w-full h-full min-h-[200px] border-0"
        sandbox="allow-scripts"
      />
    </div>
  )
}
