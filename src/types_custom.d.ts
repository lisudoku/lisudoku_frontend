declare module 'use-react-screenshot';

declare const __APP_VERSION__: string;
declare const __SOLVER_VERSION__: string;
declare const __SUDOKU_FORMATS_VERSION__: string;

declare module '@honeybadger-io/rollup-plugin' {
  import type { Plugin } from 'vite'
  import type { Types } from '@honeybadger-io/plugin-core'

  export default function honeybadgerRollupPlugin(
    options: Types.HbPluginUserOptions,
  ): Plugin
}
