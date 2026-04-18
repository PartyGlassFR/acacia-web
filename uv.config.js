self.__uv$config = {
    prefix: '/acacia-web/uv/service/',
    bare: 'https://bare.benrogo.net/', // Swapped from tomp.app to a working bridge!
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/acacia-web/uv.handler.js',
    bundle: '/acacia-web/uv.bundle.js',
    config: '/acacia-web/uv.config.js',
    sw: '/acacia-web/uv.sw.js',
};
