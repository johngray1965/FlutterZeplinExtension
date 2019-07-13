import {
    MAX_BRIGHTNESS,
    HEX_BASE,
    HUE_MAX_DEGREE,
    MAX_PERCENTAGE
} from "../constants";

var alphaFormatter = new Intl.NumberFormat("en-US", {
    useGrouping: false,
    maximumFractionDigits: 2
});

function toHex(num) {
    return (num < HEX_BASE ? "0" : "") + num.toString(HEX_BASE);
}

function blendColors(colors) {
    return colors.reduce((blendedColor, color) => blendedColor.blend(color));
}

function getColorStringByFormat(color, colorFormat) {
    if (!("r" in color && "g" in color && "b" in color && "a" in color)) {
        return;
    }

    switch (colorFormat) {
        case "hex":
            return toHexString(color);

        case "rgb":
            return toRGBAString(color);

        case "hsl":
            return toHSLAString(color);

        case "default":
        default:
            return toDefaultString(color);
    }
}

function getColorMapByFormat(colors, colorFormat) {
    return colors.reduce((colorMap, color) => {
        var colorString = getColorStringByFormat(color, colorFormat);
        /*
            We don't want to override already set keys because
            colors are supplied from bottom to top (first from local styleguide then linked styleguide then styleguides from children to parent)
        */
        colorMap[colorString] = colorMap[colorString] ? colorMap[colorString] : color.name;
        return colorMap;
    }, {});
}

function toHexString(color, prefix) {
    var hexCode = color.hexBase();

    if (color.a < 1) {
        var hexA = toHex(color.a * MAX_BRIGHTNESS);

        hexCode = prefix ? (hexA + hexCode) : (hexCode + hexA);
    }

    return `#${hexCode}`;
}

function toRGBAString(color) {
    var rgb = `${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}`;

    var rgbStr = color.a < 1
        ? `rgba(${rgb}, ${alphaFormatter.format(color.a)})`
        : `rgb(${rgb})`;

    return rgbStr;
}

function toHSLAString(color) {
    var hslColor = color.toHSL();
    var hsl = `${Math.round(hslColor.h * HUE_MAX_DEGREE)}, ` +
              `${Math.round(hslColor.s * MAX_PERCENTAGE)}%, ` +
              `${Math.round(hslColor.l * MAX_PERCENTAGE)}%`;

    var hslStr = color.a < 1
        ? `hsla(${hsl}, ${alphaFormatter.format(color.a)})`
        : `hsl(${hsl})`;

    return hslStr;
}

function toDefaultString(color) {
    return color.a < 1 ? toRGBAString(color) : toHexString(color);
}

export {
    blendColors,
    getColorMapByFormat,
    toDefaultString,
    getColorStringByFormat
};