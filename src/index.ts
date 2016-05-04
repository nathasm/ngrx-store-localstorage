import 'rxjs/add/operator/do';
import {provide, Provider} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {POST_MIDDLEWARE, INITIAL_STATE} from '@ngrx/store';

const validateStateKeys = (keys: string[]) => {
    return keys.map(key => {
        if(typeof(key) !== 'string'){
            throw new TypeError(
                `localStorageMiddleware Unknown Parameter Type: `
                + `Expected type of string, got ${typeof key}`
            );
        }
        return key;
    });
};

const rehydrateApplicationState = (keys: string[]) => {
    let rehydratedState = keys.reduce((acc, curr) => {
        let stateSlice = localStorage.getItem(curr);
        if(stateSlice){
            return Object.assign({}, acc, { [curr]: JSON.parse(stateSlice) })
        }
        return acc;
    }, {});

    return provide(INITIAL_STATE, { useValue: rehydratedState });
};

const createLocalStorageMiddleware = (keys : string[]) => {
    const stateKeys = validateStateKeys(keys);
    return (obs:Observable<any>) => {
        return obs.do(state => {
            stateKeys.forEach(key => {
                let stateSlice = state[key];
                if (typeof(stateSlice) !== 'undefined') {
                    localStorage.setItem(key, JSON.stringify(state[key]));
                }
            });
        });
    }
};

export const localStorageMiddleware = (keys : string[], rehydrateState : boolean = false) => {
    const middleware = createLocalStorageMiddleware(keys);
    const localStorageProvider = provide(POST_MIDDLEWARE, {
        multi: true,
        useValue: middleware
    });

    return rehydrateState
        ? [localStorageProvider, rehydrateApplicationState(keys)]
        : [localStorageProvider]
};
