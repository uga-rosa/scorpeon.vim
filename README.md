**WIP**

![example](https://user-images.githubusercontent.com/82267684/200194915-700c3830-1d88-4cc6-813f-905b55fb7eef.png)

# dps-vsctm.vim

Syntax highlight using VSCode's json/plist as is.

VSCode is the most popular editor in the world and is officially supported by the largest number of language developers.
This plugin allows VSCode's syntax highlighting definitions to be used directly in vim/neovim.

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

Any VSCode extension supports this structure and can be easily added.

```sh
# Add support for Nim.
git clone https://github.com/saem/vscode-nim.git ~/.cache/vsctm/extensions/nim
```

You must define the following variable.

```vim
let g:vsctm_extensions_path = expand('~/.cache/vsctm/extensions')
```

You can enable/disable highlight with the following commands.
Enabling highlight is buffer-local.

```vim
:VsctmHighlightEnable
:VsctmHighlightDisable
```

`g:vsctm_highlight` can be set to automatically enable it for specific file types.
`enable` is a boolean or an array.
Default `enable` is `v:false`.
Highlight is enabled when the an array `enable` contains `&ft` or a boolean `enable` is `v:true`.
When `enable` is set to `v:true`, `disable` is meaningful.
`disable` is an array or a function (no arguments).
If the array `disable` contains `&ft` or the function `disable` returns truthy, highlight is not enabled.

```vim
let g:vsctm_highlight = {
    \ 'enable': ['typescript', 'nim']
    \ 'disable': []
    \}
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

This command is useful to find out the scope name.

```vim
:VsctmShowScope
```
