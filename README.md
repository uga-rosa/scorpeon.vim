**WIP**

# dps-vsctm.vim

Syntax highlight using VSCode's json/plist as is.

# Requirements

- [denops.vim](https://github.com/vim-denops/denops.vim)

# Usage

First, the grammar definition file must be placed in the proper structure and tell to this plugin.
Available formats are json and plist. Please place them directly under one directory with the name `{filetype}.json/plist`.

```sh
❯ ls ~/syntaxes                          
c.json  cpp.json  lua.json
```

In addition, check the contents of that definition file to make sure that the `scopeName` is `source.{filetype}`.

```sh
❯ head ~/syntaxes/lua.json 
{
        "information_for_contributors": [
                "This file has been converted from https://github.com/sumneko/lua.tmbundle/blob/master/Syntaxes/Lua.plist",
                "If you want to provide a fix or improvement, please create a pull request against the original repository.",
                "Once accepted there, we are happy to receive an update request."
        ],
        "version": "https://github.com/sumneko/lua.tmbundle/commit/bc74f9230c3f07c0ecc1bc1727ad98d9e70aff5b",
        "name": "Lua",
        "scopeName": "source.lua",
        "patterns": [
```

After proper placement, set the path to that directory in `g:vsctmSyntaxesDir`.

```vim
let g:vsctmSyntaxesDir = expand('~/syntaxes')
```

Once this is done, all that remains is to execute the command.
Oops, make sure to turn off the default and tree-sitter highlights beforehand.

```vim
" TSDisable highlight
syntax off
```

This command requires no arguments; it highlights by reference to `&ft` for `expand('%')`.

```vim
VsctmHl
```
