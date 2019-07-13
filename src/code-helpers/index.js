import {
    generateLayerStyleObject,
    generateStyleguideTextStylesObject
} from "./style-object-helpers";
import {
    generateName,
    getColorMapByFormat,
    getColorStringByFormat,
    getResources
} from "../utils";

import { REACT_RULES_WITH_COLOR, JSON_SPACING } from "../constants";

var HEX_BASE = 16;
var MAX_BRIGHTNESS = 255;

function toHex(num) {
    var hex = num.toString(HEX_BASE);
    return hex.length == 1 ? "0" + hex : hex;
}

function toHexString(color) {
    var hexA = toHex(Math.round(color.a * MAX_BRIGHTNESS));

    var hexR = toHex(color.r);
    var hexG = toHex(color.g);
    var hexB = toHex(color.b);

    return `0x${hexA}${hexR}${hexG}${hexB}`;
}

function getStyleguideColorTexts(colorFormat, colors) {
    return colors.map(color => {
        var colorStyleObject = getColorStringByFormat(
            color,
            colorFormat
        );
        return `  static const ${color.name} = const Color(${toHexString(color)})`;
    });
}

function getStyleguideColorsCode(options, colors) {
    var { colorFormat } = options;
    var styleguideColorTexts = getStyleguideColorTexts(colorFormat, colors);
    return `const colors = {\n${styleguideColorTexts.join(",\n")}\n};`;
}

//function getColor(context, color, force) {
function getColor(color) {
    //     var projectColor = context.project.findColorEqual(color)
	// if (projectColor && !force) {
	//     return `${getColorClassName(context)}.${projectColor.name}`
	// } else {
    return `const Color(${toHexString(color)})`;
	// }
}

function getStyle(options, containerAndType, style) {
    var divisor = 1; //context.project.densityDivisor;

    var elements = [];

    //return JSON.stringify(style, null, 2)
    if ('color' in style) {
        elements.push(`    color:  ${getColor(style.color)}`);
    }

    if ('fontWeight' in style) {
        elements.push(`    fontWeight: FontWeight.w${style.fontWeight}`);
    }

    if ('fontFamily' in style) {
        elements.push(`    fontFamily: "${style.fontFamily}"`);
    }

    if ('fontStyle' in style) {
        elements.push(`    fontStyle:  FontStyle.${style.fontStyle}`);
    }

    if ('fontSize' in style) {
        elements.push(`    fontSize: ${(style.fontSize/divisor).toFixed(1)}`);
    }

    return `const TextStyle(
${elements.join(",\n")}
)`;
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }
  
function getStyleguideTextStylesCode(options, containerAndType, textStyles) {
	return textStyles.map(style => {
		return `  static const ${camelize(style.name)} = ${getStyle(options, containerAndType, style)}`;
	});

}

function getTextSpan(options, containerAndType, content, textStyle) {
    return `TextSpan(
        style: ${getStyle(options, containerAndType, textStyle)},
        text: "${content}")`;
}

function getTextSpans(options, containerAndType, content, textStyles) {
    return textStyles.map( textStyle => {
        var str = content.substring(textStyle.range.start, textStyle.range.end+1);

        return getTextSpan(options, containerAndType, str, textStyle.textStyle)
    });
}

function handlePadding(code, rect) {
    if (rect.x == 0 && rect.y == 0) {
        return code;
    }
    return `Padding(
        padding: EdgeInsets.only(top: ${rect.y}, left: ${rect.x}),
        child: ${code},
      )`;
}

function handleOpacity(code, opacity) {
    if (opacity == 1) {
        return code;
    }
    return `Opacity(
        opacity : ${opacity},
        child: ${code},
      )`;
}
// function handleRotation(code, rotation) {
//     if (opacity == 1) {
//         return code;
//     }
//     return `Opacity(
//         opacity : ${opacity},
//         child: ${code},
//       )`;
// }

function handleBorder(borderRadius, borders, fills) {
    var attrs = [];
    if (borderRadius != 0) {
        attrs.push(`borderRadius: BorderRadius.all(
            Radius.circular(${borderRadius}) 
        )`);
    }
    var color = getColor({r: 0, b: 0, g: 0, a: 255});
    var width = 1;
    if (borders.length != 0) {
        var borderAttrs = [];
        var border = borders[0];
        if (border.fill.type == "color") {
            color = getColor(border.fill.color);
            borderAttrs.push(`color: ${color}`)
        }
        if (border.thickness != null) {
            width = border.thickness;
            borderAttrs.push(`width: ${width}`)
        }
        attrs.push(`border: Border.all(
            ${borderAttrs.join(",\n")}
          )`)
    }
    var fill = handleFill(fills);
    if (fill.length != 0) {
        attrs.push(fill);
    }
    if (attrs.length > 0) {
        return `decoration: new BoxDecoration(
            ${attrs.join(",\n")}
        ),`;
    } else {
        return "";
    }
}

function handleFill(fills) {
    if (fills.length == 0) {
        return ""
    }
    var color = "";
    var width = 1;
    if (fills.length != 0) {
        var fill = fills[0];
        if (fill.type == "color") {
            color = getColor(fill.color);
        }
    }
    if (color == "") {
        return "";
    }
    return `color: ${color},`
}

function getLayerCode(containerAndType, layer, options) {
    var { container, type } = containerAndType;
    var { useLinkedStyleguides, showDimensions, colorFormat, defaultValues } = options;

    // var layerStyleRule = generateLayerStyleObject({
    //     layer,
    //     platform: container.type,
    //     densityDivisor: container.densityDivisor,
    //     showDimensions,
    //     colorFormat,
    //     defaultValues
    // });

    // var cssObjects = [];

    // if (Object.keys(layerStyleRule).length > 1) {
    //     cssObjects.unshift(layerStyleRule);
    // }
    var containerColors = getResources(container, type, useLinkedStyleguides, "colors");
    // return cssObjects.map(cssObj =>
    //     generateFlutterRule(
    //         cssObj,
    //         getColorMapByFormat(containerColors, options.colorFormat)
    //     )
    // ).join("\n\n");
    var elements = []
    var code = "";

	if (layer.type == "text") {
        var content = layer.content
        if (layer.textStyles.length > 1) {
            var textSpans = getTextSpans(container, type, content, layer.textStyles).join(",\n      ");
            code = `RichText(
  text: TextSpan(
    children: [
      ${textSpans}
    ]
  )
);`;
         } else if (layer.textStyles.length == 1) {

            var style = getStyle(options, containerAndType, layer.textStyles[0].textStyle);
            code = `Text(
    "${content}",
    style: ${style});`;

         }

         //return code;
    } else if (layer.type == "shape") {
        var border = handleBorder(layer.borderRadius, layer.borders, layer.fills);
        code = `Container(
            width: ${layer.rect.width}.0,
            height: ${layer.rect.height}.0,
            ${border}
          )`;

    // } else if (layer.type == "group") {
    }

    code = handlePadding(code, layer.rect)
    code = handleOpacity(code, layer.opacity)
    // if (code.length != 0) {
    //     return code;
    // }


    return code; // + "\n\n" + "\'" + encodeURIComponent(JSON.stringify(layer, null, 2)) + "\'";
}

export {
    getStyleguideColorsCode,
    getStyleguideTextStylesCode,
    getLayerCode
};
