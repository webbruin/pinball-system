import CryptoJS from 'crypto-js';

// 与Java保持一致的密钥和IV（字符串转UTF-8字节）
const ENCODE_KEY = 'AYOFRAMEWORK2026';   // 16字节 → AES-128
const IV_KEY = '0000000000000000';       // 16字节IV

/**
 * AES/CBC/PKCS7Padding 加密
 * @param {string} str - 明文字符串
 * @returns {string} Base64编码的密文
 */
export function encrypt(str) {
  const key = CryptoJS.enc.Utf8.parse(ENCODE_KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV_KEY);
  const encrypted = CryptoJS.AES.encrypt(str, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString(); // 默认Base64格式
}

/**
 * AES/CBC/PKCS7Padding 解密
 * @param {string} base64Str - Base64编码的密文
 * @returns {string} 明文字符串
 */
export function decrypt(base64Str) {
  const key = CryptoJS.enc.Utf8.parse(ENCODE_KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV_KEY);
  const decrypted = CryptoJS.AES.decrypt(base64Str, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}