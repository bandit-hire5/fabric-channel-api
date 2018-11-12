export default function promise(context: Object, fn: Function, ...params): Promise<any> {
    return new Promise( resolve => {
        fn.call(context, ...params, (...callbackParams) => {
            let returnObject = promiseToAssoc([...callbackParams]);

            resolve(returnObject);
        })
    })
}

function promiseToAssoc(results: Array<any>) {
    let res = {
        err: null,
        res: null,
    };

    let assoc = ['err', 'res', 'body'];

    for (let i = 0; i < results.length; i++) {
        let field = assoc[i] || `field_${i}`;

        res[field] = results[i];
    }

    if (res.err) {
        throw new Error(res.err);
    }

    return res;
}