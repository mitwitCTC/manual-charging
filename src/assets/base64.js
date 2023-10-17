export function base64Encode(text) {
    return btoa(text);
}

export function base64Decode(encodedText) {
    return atob(encodedText);
}