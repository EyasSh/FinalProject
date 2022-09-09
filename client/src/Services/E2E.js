var Buffer = require('buffer/').Buffer  // note: the trailing slash is important!

const testEncryption = async (initialMessage) => {
    const keyPair1 = await generateKeyPair()
    const keyPair2 = await generateKeyPair()
    const derivedKey1 = await deriveKey(keyPair1.publicKeyJwk, keyPair2.privateKeyJwk)
    const derivedKey2 = await deriveKey(keyPair2.publicKeyJwk, keyPair1.privateKeyJwk)
    const encryptedText = await encryptText(initialMessage, derivedKey1)
    const decryptedData = await decryptText({base64Data: encryptedText, initializationVector: new TextEncoder().encode("Initialization Vector")}, derivedKey2)
    console.log(decryptedData)
}

export const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
    {
        name: "ECDH",
        namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
    );

    const publicKeyJwk = await window.crypto.subtle.exportKey(
       "jwk",
        keyPair.publicKey
    );

    const privateKeyJwk = await window.crypto.subtle.exportKey(
        "jwk",
        keyPair.privateKey
    );

    return { publicKeyJwk, privateKeyJwk };
}

export const deriveKey = async (publicKeyJwk, privateKeyJwk) => {
    const publicKey = await window.crypto.subtle.importKey(
        "jwk",
        publicKeyJwk,
        {
          name: "ECDH",
          namedCurve: "P-256",
        },
        true,
        []
    );
    
    const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    {
        name: "ECDH",
        namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
    );
    
    return await window.crypto.subtle.deriveKey(
        { name: "ECDH", public: publicKey },
        privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

export const encryptText = async (text, derivedKey) => {
    const encodedText = new TextEncoder().encode(text);

    const encryptedData = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: new TextEncoder().encode("FNEJJ358F-K4LFOJ339-3DSSDFJR33") },
        derivedKey,
        encodedText
    );

    const uintArray = new Uint8Array(encryptedData);

    const string = String.fromCharCode.apply(null, uintArray);

    const base64Data = btoa(string);

    return base64Data;
    console.log(base64Data)
}

export const decryptText = async (text, derivedKey) => {
    try {
        const string = atob(text);
        const uintArray = new Uint8Array(
          [...string].map((char) => char.charCodeAt(0))
        );
        const algorithm = {
          name: "AES-GCM",
          iv: new TextEncoder().encode("FNEJJ358F-K4LFOJ339-3DSSDFJR33"),
        };
        const decryptedData = await window.crypto.subtle.decrypt(
          algorithm,
          derivedKey,
          uintArray
        );
    
        return new TextDecoder().decode(decryptedData);
      } catch (e) {
        return `error decrypting message: ${e}`;
    }
}
