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
mkdir -p ~/.cache/vsctm/extensions
mv vscode/extensions ~/.cache/vsctm/extensions
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
