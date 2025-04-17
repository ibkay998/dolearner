"use client"

import { useState, useEffect, useRef } from "react"
import { transform } from "@babel/standalone"

export function Preview({ code, id = "default", preloaded = false }: { code: string; id?: string; preloaded?: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const [compiledCode, setCompiledCode] = useState("")
  // Add a timestamp to force re-renders
  const [timestamp, setTimestamp] = useState(Date.now())

  // Cache for compiled code
  const codeCache = useRef<{[key: string]: string}>({});

  // Update timestamp whenever code changes to force re-renders
  useEffect(() => {
    setTimestamp(Date.now());
  }, [code]);

  // Check if we already have this code in cache
  useEffect(() => {
    if (preloaded && codeCache.current[code]) {
      setCompiledCode(codeCache.current[code]);
      setError(null);
    }
  }, [code, preloaded]);

  useEffect(() => {
    let isMounted = true;

    // Skip compilation if we already have this code in cache
    if (preloaded && codeCache.current[code]) {
      return;
    }

    const compileCode = async () => {
      try {
        // Add necessary imports and wrapper for the user's code
        // Ensure Component is defined with a unique name to avoid conflicts
        const wrappedCode = `
          // Define Component function from user code
          ${code}

          // Create preview component that renders the user's Component
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

        if (isMounted) {
          // Store in cache for future use
          codeCache.current[code] = transformedCode || '';
          setCompiledCode(transformedCode || '')
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      }
    };

    // Use a small timeout to ensure the latest code is used
    const timeoutId = setTimeout(() => {
      compileCode();
    }, 10);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [code, timestamp, preloaded])

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
        key={`preview-${id}-${timestamp}`} // Use timestamp to force re-render
        title={`preview-${id}`}
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
                  // Clear any previous definitions
                  window.Component = undefined;

                  // Inject the transformed code here
                  ${compiledCode}

                  // Ensure Component is defined before rendering
                  if (typeof PreviewComponent === 'function') {
                    root.render(
                      React.createElement(ErrorBoundary, null,
                        React.createElement(PreviewComponent)
                      )
                    );
                  } else {
                    root.render(
                      React.createElement('div', {
                        style: { color: 'red', padding: '1rem' }
                      }, 'Error: PreviewComponent is not defined')
                    );
                  }
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
