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

export interface IExceptionDefinition {

    /**
     * The code of the exception.
     */
    'code': number;

    /**
     * The name of the exception.
     */
    'name': string;

    /**
     * The human-friendly description about the exception.
     */
    'message': string;

    /**
     * The module the exception belongs to.
     */
    'module': string;

    /**
     * The metadata of the exception.
     */
    'metadata': Record<string, any>;

    /**
     * The type of the exception.
     */
    'type': string;
}

/**
 * The raw data of an exception object.
 */
export interface IExceptionRawData extends IExceptionDefinition {

    /**
     * The stack where the exception is thrown.
     */
    'stack'?: string;

    /**
     * The origin exception info.
     */
    'origin'?: any;
}

export interface IException extends Readonly<IExceptionRawData> {

    /**
     * Format the exception to URI string.
     *
     * @param {boolean} dataOnly  Ignore origin and stack info [default: false].
     */
    toString(dataOnly?: boolean): string;

    /**
     * Get the raw data of an exception object.
     *
     * @param {boolean} dataOnly  Ignore origin and stack info [default: false].
     */
    toJSON(dataOnly?: boolean): IExceptionRawData;
}

export interface IExceptionConstructor extends Readonly<IExceptionDefinition> {

    new (meta?: Record<string, any>, origin?: any): IException;
}

export interface IExceptionRegistration {

    /**
     * The unique code of the new exception
     */
    'code'?: number;

    /**
     * The type of the exception.
     */
    'type': string;

    /**
     * The unique name of the exception in the module.
     */
    'name': string;

    /**
     * The default message of the exception.
     */
    'message': string;

    /**
     * The default metadata of the exception.
     */
    'metadata': Record<string, any>;
}

/**
 * The exception code indexing function of the new exceptions.
 */
export type ICodeIndexFn = () => number;

export interface IRegistryOptions {

    /**
     * Define the valid types of exceptions in the registry.
     */
    'types': Record<string, {

        /**
         * The exception code indexing function of the new exceptions.
         */
        'index': ICodeIndexFn;
    }>;

    /**
     * The name of the module the registry belongs to.
     */
    'module': string;
}

export interface IRegistry {

    /**
     * The name of the module the registry belongs to.
     */
    readonly 'module': string;

    /**
     * Register the definition of a new exception.
     *
     * @param info The info of the new exception.
     */
    register(info: IExceptionRegistration | string): IExceptionConstructor;

    /**
     * Identify if an error is the determined exception.
     *
     * > This method also identifies if the exception registered in this registry.
     *
     * @param e     The error to be identified.
     */
    identify(e: unknown, type?: string, name?: string): e is IException;

    /**
     * Parse the URI form exception into exception object.
     *
     * @param e     The exception URI.
     */
    parse(e: string): IException | null;

    /**
     * Convert the raw JSON data into an exception object.
     *
     * @param e     The data from `toJSON` method.
     */
    fromJSON(e: IExceptionRawData): IException;

    /**
     * Detect whether an exception exists by code or name.
     *
     * @param identity  The code or name of exception.
     */
    has(identity: number | string): boolean;

    /**
     * Get the constructor of a determined exception by code or name.
     *
     * Returns `null` if no such exception of determined identity.
     *
     * @param identity  The code or name of exception.
     */
    get(identity: number | string): IExceptionConstructor | null;

    /**
     * Get definition list of all exceptions registered in this registry.
     */
    getDefinitions(): IExceptionDefinition[];
}
