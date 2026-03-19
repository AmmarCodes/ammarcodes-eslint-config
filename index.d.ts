export interface AmmarOptions {
  /**
   * Enable React support
   * @default false
   */
  react?: boolean;

  /**
   * Enable TypeScript support
   * @default true
   */
  typescript?: boolean;
}

/**
 * Generate ESLint configuration
 * @param options - Configuration options
 * @returns Array of ESLint flat config objects
 */
export default function ammar(
  options?: AmmarOptions
): Promise<import('eslint').Linter.Config[]>;
