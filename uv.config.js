self.__uv$config = {
    prefix: '/acacia-web/uv/service/',
    bare: 'https://tomp.app/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: 'https://unpkg.com/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.handler.js',
    bundle: 'https://unpkg.com/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.bundle.js',
    config: '/acacia-web/uv.config.js',
    sw: 'https://unpkg.com/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.sw.js',
};
