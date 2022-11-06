**WIP**

# dps-vsctm.vim

Syntax highlight using VSCode's json/plist as is.

# Requirements

- [denops.vim](https://github.com/vim-denops/denops.vim)

# Usage

This plugin reads the VSCode directory structure named `extensions/` as it is.
Read `extensions/*/package.json` and resolve syntaxes path.

```sh
git clone https://github.com/microsoft/vscode.git --depth 1
mkdir -p ~/.cache/vsctm
mv vscode/extensions ~/.cache/vsctm
```

You must define the following variable.

```vim
let g:vsctm_extensions_path = expand('~/.cache/vsctm/extensions')
```

Then you can enable/disable the highlighting with the following command.

```vim
:VsctmHighlightEnable
:VsctmHighlightDisable
```

# Customize

You can customize default rule via defining highlight group.
See `plugin/vsctm.vim` for default definitions.
Highlight names correspond to scope names, and the general naming convention for scope names can be found [here](https://macromates.com/manual/en/language_grammars) (12.4).

It can be customized by specifying a highlight group corresponding to the scope name.
For example, the following configuration will highlight commented parts of typescript with Error.

```vim
let g:vsctm_rule = {
\    'source.ts': {
\        'comment': 'Error'
\    }
\}
```
