const request = require('supertest');
const mongoose = require('mongoose');
// const MongoMemServer = require ('mongodb-memory-server');
const User = require('../models/User');
const app = require('../app');

// let mongod;
// let User;

// beforeAll(async () => {
//     mongod = new MongoMemServer();
//     const DBUrl = await mongod.getConnectionString();
//     const mongooseOpts = { 
//         useMongoClient: true,
//         promiseLibrary: global.Promise 
//     };
//     mongoose.connect(DBUrl, mongooseOpts, (err) => {
//         if (err) console.error(err);
//       }
//     );

//     mongoose.connection.once('open', () => {
//         console.log(`MongoDB successfully connected to ${DBUrl}`);
//         User = require('../models/User');
//     });

//   });
  
//   afterAll(() => {
//     mongoose.disconnect();
//     mongoServer.stop();
//   });

// describe('Test the root path', () => {
    
//     it('should respond to the GET method', (done) => {
//         request(app).get('/')
//             .expect(200)
//             .end((err) => {
//                 if (err) throw err;
//                 done();
//             });
//     });
// });


// JEST VERSION

describe('Test the root path', () => {
    test('It should respond the GET method', (done) => {
        request(app).get('/').then((response) => {
            console.log(response);
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});

describe('Test API root path', () => {
    test('It should respond to the GET method', (done) => {
        request(app).get('/api/v1').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});


// MOCHA VERSION


// describe('Test the API root path', () => {
    
//     it('should respond to the GET method', (done) => {
//         request(app).get('/api/v1')
//             .expect(200)
//             .end((err) => {
//                 if (err) throw err;
//                 done();
//             });
//     });
// });

