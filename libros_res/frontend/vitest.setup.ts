import '@testing-library/jest-dom';

// Configuración adicional para testing-library
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpia el DOM después de cada test
afterEach(() => {
  cleanup();
});