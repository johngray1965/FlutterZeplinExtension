import {
    isHtmlTag,
    round,
    selectorize,
    blendColors,
    layerHasGradient,
    layerHasBlendMode,
    generateName,
    getColorStringByFormat
} from "../utils";

import {
    NUMERICAL_FONT_BOLD,
    NUMERICAL_FONT_NORMAL
} from "../constants";

function generateShadowStyleObject({
    shadow,
    platform,
    layerType,
    densityDivisor,
    colorFormat
}) {
    if (layerType === "text") {
        return {
            textShadowColor: getColorStringByFormat(shadow.color, colorFormat),
            textShadowOffset: {
                width: round(shadow.offsetX / densityDivisor, 1),
                height: round(shadow.offsetY / densityDivisor, 1)
            },
            textShadowRadius: round(shadow.blurRadius / densityDivisor, 1)
        };
    }

    if (platform === "android") {
        return {};
    }

    // "iOS" doesn't have shadow spread
    return {
        shadowColor: getColorStringByFormat(shadow.color, colorFormat),
        shadowOffset: {
            width: round(shadow.offsetX / densityDivisor, 1),
            height: round(shadow.offsetY / densityDivisor, 1)
        },
        shadowRadius: round(shadow.blurRadius / densityDivisor, 1),
        shadowOpacity: 1.0
    };
}

function generateBorderStyleObject(border, layerType, densityDivisor, colorFormat) {
    if (layerType === "text" || (border.fill && border.fill.type === "gradient")) {
        return {};
    }

    return {
        borderStyle: "solid",
        borderWidth: round(border.thickness / densityDivisor, 1),
        borderColor: getColorStringByFormat(border.fill.color, colorFormat)
    };
}

function generateTextLayerStyleObject({
    layer,
    font,
    densityDivisor,
    colorFormat,
    defaultValues,
    layerStyle
}) {
    var styles = generateTextStyleStyleObject({
        textStyle: font,
        densityDivisor,
        colorFormat,
        defaultValues,
        layerStyle
    });

    if (layer.fills && layer.fills.length && !layerHasGradient(layer)) {
        delete styles.color;

        var blendedColor = blendColors(layer.fills.map(fill => fill.color));

        if (font.color) {
            blendedColor = blendedColor.blend(font.color);
        }

        styles.color = getColorStringByFormat(blendedColor, colorFormat);
    }

    return styles;
}
/* eslint-disable complexity */
function generateLayerStyleObject({
    layer,
    platform,
    densityDivisor,
    showDimensions,
    colorFormat,
    defaultValues
}) {
    var layerType = layer.type;

    var styles = {
        selector: selectorize(layer.name) || ".layer"
    };

    if (showDimensions) {
        styles.width = round(layer.rect.width / densityDivisor, 1);
        styles.height = round(layer.rect.height / densityDivisor, 1);
    }

    if (layer.rotation) {
        styles.transform = `rotate(${-layer.rotation}deg)`;
    }

    if (layer.opacity !== 1) {
        var PRECISION = 2;
        styles.opacity = round(layer.opacity, PRECISION);
    }

    if (layer.borderRadius) {
        styles.borderRadius = round(layer.borderRadius / densityDivisor, 1);
    }

    if (layerType === "text" && layer.defaultTextStyle) {
        var textStyle = generateTextLayerStyleObject({
            layer,
            font: layer.defaultTextStyle,
            densityDivisor,
            colorFormat,
            defaultValues
        });

        delete textStyle.selector;
        Object.assign(styles, textStyle);
    } else if (layer.fills.length && !layerHasGradient(layer) && !layerHasBlendMode(layer)) {
        styles.backgroundColor = getColorStringByFormat(
            blendColors(layer.fills.map(fill => fill.color)),
            colorFormat
        );
    }

    if (layer.shadows.length) {
        // Multiple shadows can only be achieved with multiple views
        Object.assign(styles,
            generateShadowStyleObject({
                shadow: layer.shadows[layer.shadows.length - 1],
                platform,
                layerType,
                densityDivisor,
                colorFormat
            })
        );
    }

    if (layer.borders.length) {
        Object.assign(styles,
            generateBorderStyleObject(
                layer.borders[layer.borders.length - 1],
                layerType,
                densityDivisor,
                colorFormat
            )
        );
    }

    return styles;
}

function generateTextStyleStyleObject({
    textStyle,
    densityDivisor,
    colorFormat,
    defaultValues,
    layerStyle
}) {
    var selector = selectorize(textStyle.name);
    if (!isHtmlTag(selector)) {
        selector = selector.substring(1);
    }

    var styleProperties = {
        selector
    };
    var overrideLayerStyle;

    styleProperties.fontFamily = textStyle.fontFamily;
    styleProperties.fontSize = round(textStyle.fontSize / densityDivisor, 1);

    overrideLayerStyle = layerStyle && layerStyle["font-weight"] && layerStyle["font-weight"] !== "normal";
    if (textStyle.fontWeight === NUMERICAL_FONT_BOLD) {
        styleProperties.fontWeight = "bold";
    } else if (textStyle.fontWeight !== NUMERICAL_FONT_NORMAL) {
        styleProperties.fontWeight = String(textStyle.fontWeight);
    } else if (defaultValues || overrideLayerStyle) {
        styleProperties.fontWeight = "normal";
    }

    overrideLayerStyle = layerStyle && layerStyle["font-style"] && layerStyle["font-style"] !== "normal";
    if (textStyle.fontStyle && (textStyle.fontStyle !== "normal" || defaultValues || overrideLayerStyle)) {
        styleProperties.fontStyle = textStyle.fontStyle === "oblique" ? "italic" : textStyle.fontStyle;
    }

    if (textStyle.lineHeight) {
        styleProperties.lineHeight = round(textStyle.lineHeight / densityDivisor, 1);
    }

    overrideLayerStyle = layerStyle && layerStyle["letter-spacing"] && layerStyle["letter-spacing"] !== "normal";
    if (textStyle.letterSpacing) {
        var PRECISION = 2;
        styleProperties.letterSpacing = round(textStyle.letterSpacing / densityDivisor, PRECISION);
    } else if (defaultValues || overrideLayerStyle) {
        styleProperties.letterSpacing = 0;
    }

    if (textStyle.textAlign) {
        styleProperties.textAlign = textStyle.textAlign;
    }

    if (textStyle.color) {
        styleProperties.color = getColorStringByFormat(textStyle.color, colorFormat);
    }

    return styleProperties;
}

function generateTextStyleCode(textStyle, params) {
    var fontStyles = generateTextStyleStyleObject({
        textStyle,
        densityDivisor: params.densityDivisor,
        colorFormat: params.colorFormat,
        defaultValues: params.defaultValues
    });
    var selector = generateName(fontStyles.selector);
    var textStyleCode = {};

    delete fontStyles.selector;

    if (params.containerColor) {
        fontStyles.color = `colors.${params.containerColor.name}`;
    }

    textStyleCode[selector] = fontStyles;

    return textStyleCode;
}

function generateStyleguideTextStylesObject(options, containerAndType, textStyles) {
    var { container } = containerAndType;
    var params = {
        densityDivisor: container.densityDivisor,
        colorFormat: options.colorFormat,
        defaultValues: options.defaultValues
    };

    return textStyles.reduce((styles, ts) => {
        var tsParams;
        if (ts.color) {
            var containerColor = container.findColorEqual(ts.color, options.useLinkedStyleguides);
            tsParams = Object.assign({}, params, { containerColor });
        } else {
            tsParams = params;
        }

        var textStyle = generateTextStyleCode(ts, tsParams);
        return Object.assign(styles, textStyle);
    }, {});
}

export {
    generateTextLayerStyleObject,
    generateLayerStyleObject,
    generateStyleguideTextStylesObject
};