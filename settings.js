module.exports = {
    mongodb: {
        host: 'localhost',
        db: 'fastlib'
    },
    error: {
        bookNotFound: {
            message: 'Cannot find books.',
            status: 404,
            flag: true
        },
        locked: {
            message: 'The resource that is being accessed is locked.',
            status: 423
        },
        badRequest: {
            message: 'Request error.',
            status: 500
        },
        adminExists: {
            message: 'Admin exists.',
            status: 423
        }
    },
    hashLen: 10,
    perPage: 20,
    md5Secret: 'secret'
};