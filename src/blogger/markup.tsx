import { type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Tokens keep Blogger instructions out of React's HTML escaping and validation.
export function createBloggerRenderer() {
  const instructions = new Map<string, string>();
  function Blogger({ xml, children }: { xml: string; children?: ReactNode }) {
    const token = `BLOGGER_INSTRUCTION_${instructions.size}_END`;
    instructions.set(token, '');
    instructions.set(token, xml.replace('<!-- children -->', renderToStaticMarkup(<>{children}</>)));
    return token;
  }
  function render(element: ReactNode) {
    let result = renderToStaticMarkup(<>{element}</>);
    // Instructions may contain other instructions rendered by nested components.
    for (let pass = 0; pass <= instructions.size; pass++) {
      const next = result.replace(/BLOGGER_INSTRUCTION_\d+_END/g, (token) => {
        const instruction = instructions.get(token);
        if (instruction === undefined) throw new Error(`Unknown Blogger instruction: ${token}`);
        return instruction;
      });
      if (next === result) return result;
      result = next;
    }
    throw new Error('Circular Blogger instructions');
  }
  return { Blogger, render };
}
