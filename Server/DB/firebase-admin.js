var admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = {
    "type": "service_account",
    "project_id": "trial-3f5ca",
    "private_key_id": "10e3517fa9f4e4f3d86caa5ffb8e9fe95ac0bc89",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDs2jl7Oa42S6l2\nnhImwNvhBFhl3vxVYaA7YQGrVxuYJwAvAC2f/NRJ85OsIckaJU1B61OxnABtpVFm\nXUnpqQ4DiPnPG6D2SGQizjwHnm5pBZC/al3Bx60wQecnT/v0tLFcsOdz8iJWNJ5U\nkPPmj1i5KZ3RWwcLNQW6e5arSZdUamALOD0ia1Cc0leu6wnOk4FHjmngPm3nREI6\nKQ8hfzIetrk6cUb70eznNn7Sqt5XaruQgKJPTuINBTCpKNB7qkdw/QhvczreMweb\nbOwTg5aRa900vb9FJrN9JOsy+a/hTUotwU2N8lWrV+MQw1ki6oYK9+kGdm6aLuqA\nDc0E5JhvAgMBAAECggEAGck8XtUNyW19WqOk+EEg7yOI+DZJpIYHas+J3fySzYLZ\ne0R6syNUfWSeXCwld8o92gJjzz9bsJRCA3H+nQjBtNLR16F7abTB6iQn1vCBtr9b\nXeuXn4Q8r7dNEjOcC60sbhn4aOAgqt/5qN1LIHvUvfvw6Z0ObELuh7ny0l0ls5PX\nkr6LgDfjzHRfl7ksLsc78/20L9Tmd35HPiy67VTDDJSQW73H1e0oT9yBJaudYt6I\n4rrxHDOhYk7V9U/+QxfH3qG7s4qew97YDJAyG9Q1Pg6Vtbfy8qa/6w7Dx2nXpnon\nTFLJwQojswLycJs/6BMH5dpoUr/S/z9y5CHd1u6l0QKBgQD9z5x7VepIU2FrD4y1\nPcJYtluv7TTVKYmSIo0SaUGApCfZOiWX0Lh/j11v79RgBYzzuBOa6gqf5+BgKOtp\nUW+GmY0MpJ1xlE9ik5iZBxiKX0TJRJp2TT5M3ME2ZF7AZvK0JoonztXq6Fz9z7oV\npD2OJjFZlBIKJuWFQBnkWRFQyQKBgQDu5SupKHwm85NLjl66dxOUvFZriJR5sPce\nTDWnwUIFY3cyXpT3HgDps2ILr8EJFY5H0WZTPVeTjs0LMcXwi1qLOQs42W0vx1Z/\nag7/xXkcHew+cb8oS+mZsJ5Npa4qISDvkPQfL8/ubxIX5WAS1KUlyaPJbCTStJJC\n//0F9MAzdwKBgGvWevD4NvuV2a1IRQt4ewuAJ4Ke8TSkWlwpq/CnofoLRRcJmpFf\nUBR6kEOQDZbipNmkW0gVqn/4YB/bIvJzdEQnF4PIqVBpqDUE6vAR0L5x7eLp8ArV\nlOPJY5o9mPh8hSA/w7FYMxGEuoXobXLmfnTYC125CNUhY6Fy881OfonpAoGBAJXW\n5CW7oPOFf3O6nqvyGDQIVWQpTIdvefBk+Jp52wEqPA85x9Gf3g63Vt3hpQAfpxhg\nvP+k0BNbVDybQX34yhfc9a74oUWAkD5mtXWz1JzQH+eizLVnt+OQJhqpuq3uDYx1\nrMkK4i65N+4JDtOA0Pz8lmC2FfqbC8o+aeOcehlNAoGBALidwBdUPV+Aby39QoWg\nlmgU1xualsoIREAUJcBBivWPFgzelMFNBD8sixNJMmpxsSpyEkQ00RcLLG8jCvl+\nEo5dzYoIBDdnGN34PcjgsJw3H9kKjtcPTZTmTEmYPpJMA1N1sSvrkXhh3joA16sD\n4/GH0xe1rINgirJTNnkuqRI1\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-yipx2@trial-3f5ca.iam.gserviceaccount.com",
    "client_id": "101958240002645105355",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-yipx2%40trial-3f5ca.iam.gserviceaccount.com"
}  

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

module.exports = {admin, db}