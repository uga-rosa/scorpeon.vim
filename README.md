**WIP**

![example](https://user-images.githubusercontent.com/82267684/201442856-896b3c30-e755-432e-a7dd-b6073d34df2a.png)

# scorpeon.vim

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
mkdir -p ~/.cache/scorpeon
mv vscode/extensions ~/.cache/scorpeon
```

Any VSCode extension supports this structure and can be easily added.

```sh
# Add support for Nim.
git clone https://github.com/saem/vscode-nim.git ~/.cache/scorpeon/extensions/nim
```

You must define the following variable.

```vim
" string or an array of string
let g:scorpeon_extensions_path = expand('~/.cache/scorpeon/extensions')
```

You can also use the plugin manager to manage them. See [advanced settings](#advanced-settings).

You can enable/disable highlight with the following commands.
Enabling highlight is buffer-local.

```vim
:ScorpeonHighlightEnable
:ScorpeonHighlightDisable
```

`g:scorpeon_highlight` can be set to automatically enable it for specific file types.

`enable` is a boolean or an array.
Default `enable` is `v:false`.
Highlight is enabled when the an array `enable` contains `&ft` or a boolean `enable` is `v:true`.

`disable` is meaningful when the result of `enable` evaluate to `v:true`.
`disable` is an array or a function (no arguments).
Default `disable` is `[]`.
If an array `disable` contains `&ft` or the function `disable` returns truthy, highlight is not enabled.

In the following example, it is only enabled when the file type is `typescript` or `nim` and the file size is less than 1MB.

```vim
let g:scorpeon_highlight = {
      \ 'enable': ['typescript', 'nim'],
      \ 'disable': { -> getfsize(expand('%')) > 1 * 1024 * 1024 }
      \ }
```

# Customize

You can customize default rule via defining highlight group.
See `plugin/scorpeon.vim` for default definitions.
Highlight names correspond to scope names, and the general naming convention for scope names can be found [here](https://macromates.com/manual/en/language_grammars) (12.4).

It can be customized by specifying a highlight group corresponding to the scope name.
For example, the following configuration will highlight commented parts of typescript with Error.

```vim
let g:scorpeon_rule = {
\    'source.ts': {
\        'comment': 'Error'
\    }
\}
```

This command is useful to find out the scope name.

```vim
:ScorpeonShowScope
```

# Advanced settings

Here is an example of managing with dein.vim.

```vim
let g:scorpeon_extensions_path = [
  \ expand('$CACHE/vscode/extensions'),
  \ expand('$CACHE/scorpeon'),
  \ ]
```

```toml
[[plugins]]
repo = 'microsoft/vscode'
if = 0
merged = 0
type__depth = 1
path = '$CACHE/vscode'

[[plugins]]
repo = 'oovm/vscode-toml'
if = 0
merged = 0
path = '$CACHE/scorpeon/toml'

[[plugins]]
repo = 'emilast/vscode-logfile-highlighter'
if = 0
merged = 0
path = '$CACHE/scorpeon/log'
```
