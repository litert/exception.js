/**
 * Copyright 2021 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as C from './Common';

interface IExceptionType {

    'indexFn': () => number;
}

const BUILT_IN_TYPE_NAME = 'built_in';
const BUILT_IN_ERR_TYPE_NOT_FOUND = 'type_not_found';
const BUILT_IN_ERR_MALFORMED_TYPE = 'malformed_type';
const BUILT_IN_ERR_MALFORMED_NAME = 'malformed_name';
const BUILT_IN_ERR_MALFORMED_MODULE = 'malformed_module';
const BUILT_IN_ERR_DUP_EXCEPTION_NAME = 'dup_exception_name';
const BUILT_IN_ERR_DUP_EXCEPTION_CODE = 'dup_exception_code';

const VALIDATE_TYPE = /^(?!_)[_a-z0-9]+(?<!_)$/;
const VALIDATE_MODULE = /^(?!-)[-a-z0-9]+(?<!-)(\.(?!-)[-a-z0-9]+(?<!-))*$/;
const VALIDATE_NAME = /^(?!_)[_a-z0-9]+(?<!_)$/;

const URL_PROTOCOL = 'exception:';

class BaseException implements C.IException {

    public 'name'!: string;

    public 'code'!: number;

    public 'message'!: string;

    public 'metadata'!: Record<string, any>;

    public 'origin'!: any;

    public 'type'!: string;

    public 'module'!: string;

    public 'stack'!: string;

    public constructor(
        metadata?: Record<string, any>,
        origin?: any,
        theCtor?: string | ((...args: any[]) => any),
    ) {

        this.metadata = { ...(this.constructor as any).metadata, ...metadata };

        this.origin = origin;

        switch (typeof theCtor) {

            default:
            case 'function':
                Error.captureStackTrace(this, theCtor ?? this.constructor);
                break;

            case 'string':
                this.stack = theCtor;
                break;
        }
    }

    public toString(onlyData: boolean = false): string {

        if (onlyData) {

            return `${URL_PROTOCOL}//${this.module}/${this.type}/${this.name}?code=${
                this.code
            }&msg=${
                encodeURIComponent(this.message)
            }&meta=${
                encodeURIComponent(JSON.stringify(this.metadata))
            }`;
        }

        return `${URL_PROTOCOL}//${this.module}/${this.type}/${this.name}?code=${
            this.code
        }&msg=${
            encodeURIComponent(this.message)
        }&stack=${
            encodeURIComponent(this.stack)
        }&meta=${
            encodeURIComponent(JSON.stringify(this.metadata))
        }&origin=${
            encodeURIComponent(JSON.stringify(this.origin ?? null))
        }`;
    }

    public toJSON(onlyData: boolean = false): C.IExceptionRawData {

        return {
            code: this.code,
            name: this.name,
            message: this.message,
            stack: onlyData ? undefined : this.stack,
            origin: onlyData ? undefined : this.origin,
            metadata: this.metadata,
            module: this.module,
            type: this.type,
        };
    }
}

class ExceptionRegistry implements C.IRegistry {

    private readonly _types: Record<string, IExceptionType> = {};

    private readonly _module: string;

    private _codeIndex: Record<number, typeof BaseException> = {};

    private _nameIndex: Record<string, typeof BaseException> = {};

    public constructor(opts: C.IRegistryOptions) {

        this._module = opts.module;

        if (!VALIDATE_MODULE.test(opts.module)) {

            throw _reg().raiseError(BUILT_IN_ERR_MALFORMED_MODULE, { 'module': opts.module });
        }

        for (const t in opts.types) {

            if (!VALIDATE_TYPE.exec(t)) {

                throw _reg().raiseError(BUILT_IN_ERR_MALFORMED_TYPE, { 'type': t });
            }

            const typ = opts.types[t];

            this._types[t] = {
                'indexFn': typ.index
            };
        }
    }

    public get module(): string {

        return this._module;
    }

    public raiseError(
        name: string,
        metadata?: Record<string, any>,
        origin?: any,
    ): C.IException {

        const ctor = this._nameIndex[name.toLowerCase()];

        // eslint-disable-next-line @typescript-eslint/unbound-method
        return new ctor(metadata, origin, this.raiseError as any);
    }

    public has(id: number | string): boolean {

        return !!(typeof id === 'string' ? this._nameIndex[id] : this._codeIndex[id as any]);
    }

    public get(id: number | string): C.IExceptionConstructor | null {

        return (typeof id === 'string' ? this._nameIndex[id] : this._codeIndex[id as any]) as C.IExceptionConstructor ?? null;
    }

    public register(opts: C.IExceptionRegistration): C.IExceptionConstructor {

        const type = this._types[opts.type];

        if (!type) {

            throw _reg().raiseError(BUILT_IN_ERR_TYPE_NOT_FOUND, { ...opts, 'module': this._module });
        }

        if (!VALIDATE_NAME.test(opts.name)) {

            throw _reg().raiseError(
                BUILT_IN_ERR_MALFORMED_NAME,
                { ...opts, 'module': this._module }
            );
        }

        const code = opts.code ?? this._types[opts.type].indexFn();

        if (this._nameIndex[opts.name]) {

            throw _reg().raiseError(
                BUILT_IN_ERR_DUP_EXCEPTION_NAME,
                { ...opts, 'module': this._module }
            );
        }

        if (this._codeIndex[code]) {

            throw _reg().raiseError(
                BUILT_IN_ERR_DUP_EXCEPTION_NAME,
                { ...opts, 'module': this._module }
            );
        }

        const ctor = (new Function('BaseException', `class ${opts.name} extends BaseException { } return ${opts.name};`))(BaseException);

        Object.defineProperties(ctor, {

            'message': {
                'writable': false,
                'configurable': false,
                'value': opts.message
            },
            'code': {
                'writable': false,
                'configurable': false,
                'value': code
            },
            'name': {
                'writable': false,
                'configurable': false,
                'value': opts.name
            },
            'module': {
                'writable': false,
                'configurable': false,
                'value': this.module
            },
            'type': {
                'writable': false,
                'configurable': false,
                'value': opts.type
            },
            'metadata': {
                'writable': false,
                'configurable': false,
                'value': opts.metadata
            }
        });

        Object.defineProperties(ctor.prototype, {

            'message': {
                'writable': false,
                'configurable': false,
                'value': opts.message
            },
            'code': {
                'writable': false,
                'configurable': false,
                'value': code
            },
            'name': {
                'writable': false,
                'configurable': false,
                'value': opts.name
            },
            'module': {
                'writable': false,
                'configurable': false,
                'value': this.module
            },
            'type': {
                'writable': false,
                'configurable': false,
                'value': opts.type
            }
        });

        this._nameIndex[opts.name] = ctor;
        this._codeIndex[code] = ctor;

        return ctor;
    }

    public identify(e: unknown, type?: string, name?: string): e is C.IException {

        return e instanceof BaseException && (
            !type || (
                this._module === e.module && type === e.type && (!name || name === e.name)
            )
        );
    }

    public parse(e: string): C.IException | null {

        try {
            const url = new URL(e);

            if (url.protocol !== URL_PROTOCOL) {

                return null;
            }

            const [, type, eName] = url.pathname.split('/');

            if (
                !url.searchParams?.has('code')
                || !url.searchParams?.has('msg')
                || !url.searchParams?.has('meta')
            ) {

                return null;
            }

            if (this._nameIndex[eName] && url.hostname === this._module) {

                return new this._nameIndex[eName](
                    JSON.parse(url.searchParams.get('meta')!),
                    url.searchParams.has('origin') ? JSON.parse(url.searchParams.get('origin')!) : null,
                    url.searchParams.get('stack') ?? ''
                );
            }

            const ret = new BaseException(
                JSON.parse(url.searchParams.get('meta')!),
                url.searchParams.has('origin') ? JSON.parse(url.searchParams.get('origin')!) : null,
            );

            ret.stack = url.searchParams.get('stack') ?? '';
            ret.message = url.searchParams.get('msg')!;
            ret.module = url.hostname;
            ret.type = type;
            ret.name = eName;
            ret.code = parseInt(url.searchParams.get('code')!);

            return ret;
        }
        catch {

            return null;
        }
    }

    public fromJSON(j: C.IExceptionRawData): C.IException {

        if (this._nameIndex[j.name] && j.module === this._module) {

            return new this._nameIndex[j.name](
                j.metadata,
                j.origin,
                j.stack ?? ''
            );
        }

        const ret = new BaseException(
            j.metadata,
            j.origin,
        );

        ret.stack = j.stack ?? '';
        ret.message = j.message;
        ret.module = j.module;
        ret.type = j.type;
        ret.name = j.name;
        ret.code = j.code;

        return ret;
    }

    public getDefinitions(): C.IExceptionDefinition[] {

        return Object.values(this._codeIndex as Record<string, C.IExceptionConstructor>).map((v) => ({
            'name': v.name,
            'code': v.code,
            'module': v.module,
            'message': v.message,
            'type': v.type,
            'metadata': { ...v.metadata }
        }));
    }
}

const internalReg = new ExceptionRegistry({
    'module': 'exceptions.litert.org',
    'types': {
        [BUILT_IN_TYPE_NAME]: {
            'index': (function() {
                let index = -0xFFFFFFFF;
                return function() { return index++; };
            })(),
        }
    }
});

/**
 * Built-in exception: The type of new exception definition is not defined.
 */
export const E_TYPE_NOT_FOUND = internalReg.register({
    'name': BUILT_IN_ERR_TYPE_NOT_FOUND,
    'message': 'The type of new exception definition is not defined.',
    'metadata': {},
    'type': BUILT_IN_TYPE_NAME
});

/**
 * Built-in exception: The type of new exception definition is malformed.
 */
export const E_MALFORMED_TYPE = internalReg.register({
    'name': BUILT_IN_ERR_MALFORMED_TYPE,
    'message': 'The type of new exception definition is malformed.',
    'metadata': {},
    'type': BUILT_IN_TYPE_NAME
});

/**
 * Built-in exception: The module name of new exception registry is malformed.
 */
export const E_MALFORMED_MODULE = internalReg.register({
    'name': BUILT_IN_ERR_MALFORMED_MODULE,
    'message': 'The module name of new exception registry is malformed.',
    'metadata': {},
    'type': BUILT_IN_TYPE_NAME
});

/**
 * Built-in exception: The name of new exception is malformed.
 */
export const E_MALFORMED_NAME = internalReg.register({
    'name': BUILT_IN_ERR_MALFORMED_NAME,
    'message': 'The name of new exception is malformed.',
    'metadata': {},
    'type': BUILT_IN_TYPE_NAME
});

/**
 * Built-in exception: The name of new exception has been used already.
 */
export const E_DUP_EXCEPTION_NAME = internalReg.register({
    'name': BUILT_IN_ERR_DUP_EXCEPTION_NAME,
    'message': 'The name of new exception has been used already.',
    'metadata': {},
    'type': BUILT_IN_TYPE_NAME
});

/**
 * Built-in exception: The code of new exception has been used already.
 */
export const E_DUP_EXCEPTION_CODE = internalReg.register({
    'name': BUILT_IN_ERR_DUP_EXCEPTION_CODE,
    'message': 'The code of new exception has been used already.',
    'metadata': {},
    'type': BUILT_IN_TYPE_NAME
});

// eslint-disable-next-line @typescript-eslint/naming-convention
function _reg(): ExceptionRegistry {

    return internalReg;
}

/**
 * Create a new exception registry object.
 * @param opts  The options of new registry.
 */
export function createExceptionRegistry(opts: C.IRegistryOptions): C.IRegistry {

    return new ExceptionRegistry(opts);
}

/**
 * Helper function that identifies whether a value is a determined exception object.
 * @param e         The value to be identified.
 * @param type      The expected exception type, optional.
 * @param name      The expected exception name, optional.
 * @param module    The expected exception module name, optional.
 */
export function identify(e: unknown, type?: string, name?: string, module?: string): e is C.IException {

    return e instanceof BaseException && (
        !type || (
            type === e.type && (!name || name === e.name) && (!module || module === e.module)
        )
    );
}

/**
 * Helper function that identifies whether a value is a determined exception object.
 * @param e             The value to be identified.
 * @param exceptionCtor The constructor of expected exception.
 */
export function equals(e: unknown, exceptionCtor: C.IExceptionConstructor): e is C.IException {

    return e instanceof exceptionCtor || (
        e instanceof BaseException
        && exceptionCtor.type === e.type
        && exceptionCtor.name === e.name
        && exceptionCtor.module === e.module
    );
}
