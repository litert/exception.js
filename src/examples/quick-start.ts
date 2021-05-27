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

/* eslint-disable @typescript-eslint/no-magic-numbers */
import * as $Exceptions from '../lib';

const registry = $Exceptions.createExceptionRegistry({
    module: 'exception.litert.org',
    types: {
        'private': {
            index: $Exceptions.createDecreaseCodeIndex(-1)
        },
        'public': {
            index: $Exceptions.createIncreaseCodeIndex(1)
        }
    }
});

const registry2 = $Exceptions.createExceptionRegistry({
    module: 'exception2.litert.org',
    types: {
        'private': {
            index: $Exceptions.createDecreaseCodeIndex(-1)
        },
        'public': {
            index: $Exceptions.createIncreaseCodeIndex(1)
        }
    }
});

const E_NO_USER = registry.register({
    type: 'public',
    name: 'no_user',
    message: 'No such a user.',
    metadata: {}
});

const E_SYNTAX_ERROR = registry.register({
    type: 'private',
    name: 'syntax_error',
    message: 'Unexpected syntax error found.',
    metadata: {}
});

const synErr = new E_SYNTAX_ERROR();

const noUserErr = new E_NO_USER();

console.error('Exception URI:      ', synErr.toString());
console.error('Exception URI:      ', noUserErr.toString());

console.info('Exception name:     ', registry.parse(noUserErr.toString())?.name);
console.info('Exception message:  ', noUserErr.message);
console.error('Exception stack:    ', registry.parse(noUserErr.toString())?.stack);

if (registry.identify(noUserErr, 'public', 'no_user')) {

    console.info('It is a NO_USER exception.');
}

try {

    registry.register({
        type: '-public',
        name: 'no_user',
        message: 'No such a user.',
        metadata: {}
    });
}
catch (e) {

    if ($Exceptions.identify(e, $Exceptions.E_TYPE_NOT_FOUND.type, $Exceptions.E_TYPE_NOT_FOUND.name)) {

        console.info('MATCHED(identify): E_TYPE_NOT_FOUND');
    }

    if ($Exceptions.equals(e, $Exceptions.E_TYPE_NOT_FOUND)) {

        console.info('MATCHED(equals): E_TYPE_NOT_FOUND');
    }

    console.error('Exception URI:    ', e.toString());
}

if (registry.has('no_user')) {

    console.info('Exception "no_user" has been defined.');

    registry2.register({
        type: 'public',
        name: 'no_user',
        message: 'No such a user.',
        metadata: {}
    });

    console.info('Successfully defined the exception "no_user" in another registry.');
}

console.info(JSON.stringify(registry.getDefinitions(), null, 2));

registry.register({
    type: 'public',
    name: 'no_user',
    message: 'No such a user.',
    metadata: {}
});
