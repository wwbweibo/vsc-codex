# codex README

## Features

using openai codex or gpt-3.5 model for code complete or explain.

## Requirements

None

## Extension Settings

- `codex.model`: the model used for this extension, current support `code-davinci-002`,`code-cushman-001` and `gpt-3.5-turbo`. please note, when using gpt-3.5-turbo model, this extension will return all the response.
- `codex.timeout`: timeout when request openai.
- `codex.apiKey`: the key from `https://platform.openai.com/account/api-keys`
- `codex.maxToken`: when using `code-davinci-002`,`code-cushman-001`, it specify max token in response.

## Known Issues

## Release Notes

### 0.0.6 

1. remove codex related code.
2. add parser for gpt model, the response will be more appropriate for editor.

### 0.0.5

first release version.
