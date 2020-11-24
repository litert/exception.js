/**
 * Copyright 2020 Angus.Fenying <fenying@litert.org>
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

/**
 * Create a code index function that always return the next bigger integer of the previous one.
 *
 * @param base  The first integer.
 */
export function createIncreaseCodeIndex(base: number): C.ICodeIndexFn {

    return () => base++;
}

/**
 * Create a code index function that always return the biggest integer that smaller than the previous one.
 *
 * @param base  The first integer.
 */
export function createDecreaseCodeIndex(base: number): C.ICodeIndexFn {

    return () => base--;
}
