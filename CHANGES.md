# Changes Logs

## v1.1.5

- feat(exception): allow `toJSON` without stack and origin.
- feat(exception): added `fromJSON` to parse data from `toJSON`.
- feat(exception): stringify exception to a short URL if needed.

## v1.1.1

- feat(registry): added registry methods
    - has: Check if a code or name is registered as an exception.
    - get: Get the constructor of determined exception by its code or name.
    - getDefinitions: List all exceptions' definitions insides a registry.

## v1.0.1

- fix(exception): fixed the name of exception constructor.
