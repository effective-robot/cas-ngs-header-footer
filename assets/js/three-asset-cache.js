(function () {
  'use strict';

  var assetCache = window.CAS_NGS_AssetCache || (window.CAS_NGS_AssetCache = {});
  if (typeof assetCache.loadGLTF === 'function') return;

  assetCache.gltfRequests = assetCache.gltfRequests || Object.create(null);
  assetCache.loadGLTF = function (url) {
    if (!url) return Promise.reject(new Error('A GLTF model URL is required.'));

    if (!assetCache.gltfRequests[url]) {
      assetCache.gltfRequests[url] = new Promise(function (resolve, reject) {
        if (!window.THREE || !window.THREE.GLTFLoader) {
          reject(new Error('Three.js GLTFLoader is unavailable.'));
          return;
        }

        var loader = new window.THREE.GLTFLoader();
        if (window.MeshoptDecoder && typeof loader.setMeshoptDecoder === 'function') {
          loader.setMeshoptDecoder(window.MeshoptDecoder);
        }
        loader.load(url, resolve, undefined, reject);
      }).catch(function (error) {
        delete assetCache.gltfRequests[url];
        throw error;
      });
    }

    return assetCache.gltfRequests[url].then(function (gltf) {
      return {
        scene: gltf.scene.clone(true),
        animations: gltf.animations
      };
    });
  };
})();
