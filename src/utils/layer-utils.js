function layerHasGradient(layer) {
    return layer.fills.some(f => f.type === "gradient");
}

function layerHasBlendMode(layer) {
    return layer.fills.some(f => f.blendMode && f.blendMode !== "normal");
}

export {
    layerHasGradient,
    layerHasBlendMode
};