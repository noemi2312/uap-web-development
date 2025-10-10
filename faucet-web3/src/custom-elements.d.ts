// Declaramos el custom element de Web3Modal para que TypeScript no marque error
import React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

export {}
