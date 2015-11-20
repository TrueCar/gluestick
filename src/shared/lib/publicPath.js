if (process.env.PUBLIC_PATH) {
    __webpack_public_path__ = process.env.PUBLIC_PATH;
} else if (__CLIENT__ && __PUBLIC_PATH__) {
    __webpack_public_path__ = __PUBLIC_PATH__;
}

export default function logPublicPath() {
    console.log(`PUBLIC PATH: ${__webpack_public_path__}`);
}

