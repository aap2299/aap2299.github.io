function createEmptyMirador(containerId) {
    Mirador.viewer({
      id: containerId,
      windows: [],      // <- empty on load
      manifests: {},    // <- nothing preloaded
      workspace: { type: "mosaic" }
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    ["mirador-1","mirador-2","mirador-3","mirador-4","mirador-5"].forEach(createEmptyMirador);
  });
  