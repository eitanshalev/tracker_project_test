

var CryptoJS = require('crypto-js');
var btoa = require('btoa');
var atob = require('atob');
var arrto64 = require('base64-arraybuffer')
var iterationCount = 1000;
var keySize = 64;
var encryptionKey  ="Abcdefghijklmnop";


// var dataToDecrypt = "2DZqzpXzmCsKj4lfQY4d/exg9GAyyj0hVK97kPw5ZxMFs3jQiEQ6LLvUsBLdkA80" //The base64 encoded string output from Java;

var iv = "2c0da04af8fee58593442bf834b30739"
var salt = "2c0da04af8fee58593442bf834b30739"




//AESUtil - Utility class for CryptoJS**
var AesUtil = function(keySize, iterationCount) {
    this.keySize = keySize / 16;
    this.iterationCount = iterationCount;
    this.key = this.generateKey(salt, encryptionKey);
    this.iv = CryptoJS.enc.Hex.parse(iv)
};

AesUtil.prototype.generateKey = function(salt, passPhrase) {
    var key = CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt),
        { keySize: this.keySize, iterations: this.iterationCount });
    return key;
}

AesUtil.prototype.decrypt = function(cipherText) {
   // var key = this.generateKey(salt, passPhrase);
    var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(cipherText)
    });

    var decrypted = CryptoJS.AES.decrypt(cipherParams,this.key,
        { iv: this.iv });
    return decrypted;
}


var aesUtil = new AesUtil(keySize, iterationCount);
//console.log(plaintext);

/* Converts a cryptjs WordArray to native Uint8Array */
function CryptJsWordArrayToUint8Array(wordArray) {
    const l = wordArray.sigBytes;
    const words = wordArray.words;
    const result = new Uint8Array(l);
//    console.log("in crypt", result.length)
    var i=0 /*dst*/, j=0 /*src*/;
    while(true) {
        // here i is a multiple of 4
        if (i==l)
            break;
        var w = words[j++];
        result[i++] = (w & 0xff000000) >>> 24;
        if (i==l)
            break;
        result[i++] = (w & 0x00ff0000) >>> 16;
        if (i==l)
            break;
        result[i++] = (w & 0x0000ff00) >>> 8;
        if (i==l)
            break;
        result[i++] = (w & 0x000000ff);
    }
    return result;
}
//****************************************


function decrypt(audioBuff){
    var dataToDecrypt = arrto64.encode(audioBuff)
    var plaintext =  aesUtil.decrypt(dataToDecrypt);
    return CryptJsWordArrayToUint8Array(plaintext);

}
module.exports = decrypt;