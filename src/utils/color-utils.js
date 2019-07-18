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

function toFlutterHexString(color) {
    var hexA = toHex(Math.round(color.a * MAX_BRIGHTNESS));

    var hexR = toHex(color.r);
    var hexG = toHex(color.g);
    var hexB = toHex(color.b);

    return `0x${hexA}${hexR}${hexG}${hexB}`;
}


function getColor(color) {
    return `const Color(${toFlutterHexString(color)})`;
}

function blendColors(colors) {
    return colors.reduce((blendedColor, color) => blendedColor.blend(color));
}

function getColorStringByFormat(color, colorFormat) {
    if (!("r" in color && "g" in color && "b" in color && "a" in color)) {
        return;
    }

    return getColor(color);
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index == 0 ? match.toLowerCase() : match.toUpperCase();
    }).replace("-","");
  }

function pascalize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return match.toUpperCase();
    }).replace(/[-/,]/g,"");
  }

function getColorMapByFormat(colors, colorFormat) {
    return colors.reduce((colorMap, color) => {
        var colorString = getColorStringByFormat(color, colorFormat);
        /*
            We don't want to override already set keys because
            colors are supplied from bottom to top (first from local styleguide then linked styleguide then styleguides from children to parent)
        */
        colorMap[colorString] = colorMap[colorString] ? colorMap[colorString] : camelize(color.name);
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
    getColorStringByFormat,
    getColor,
    camelize,
    pascalize
};