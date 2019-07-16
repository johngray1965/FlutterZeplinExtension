import {
    generateLayerStyleObject,
    generateStyleguideTextStylesObject
} from "./style-object-helpers";
import {
    generateName,
    getColorMapByFormat,
    getColorStringByFormat,
    getResources,
    getColor,
    camelize,
    debugLog
} from "../utils";

import { REACT_RULES_WITH_COLOR, JSON_SPACING, OPTION_NAMES } from "../constants";

function getStyleguideColorTexts(colorFormat, colors) {
    return colors.map(color => {
        var colorStyleObject = getColorStringByFormat(
            color,
            colorFormat
        );
        return `  static const ${camelize(color.name)} = ${getColor(color)}`;
    });
}

function getStyleguideColorsCode(options, colors) {
    var { colorFormat } = options;
    var styleguideColorTexts = getStyleguideColorTexts(colorFormat, colors);
    return `class ${getConfigName("Colors", options)} {\n${styleguideColorTexts.join(",\n")}\n};`;
}

function getStyle(options, containerAndType, style, styleMap) {
    var { container, type } = containerAndType;
    var { useLinkedStyleguides, classPrefix, divisor } = options;

    var colorMap = getColorMap(containerAndType, useLinkedStyleguides)

    if (divisor == null || divisor == 0) {
        divisor = 1;
    }

    var styleKey = JSON.stringify(style);
    if (styleMap != null && styleKey in styleMap) {
        return `${getConfigName("TextStyles", options)}.${styleMap[styleKey]}`;
    }


    var elements = [];

    //return JSON.stringify(style, null, 2)
    if ('color' in style) {
        elements.push(`    color:  ${getColorByMap(style.color, colorMap, options)}`);
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

function getConfigName(baseName, options) {
    var prefix = options[OPTION_NAMES.CLASS_PREFIX];
    if (prefix != null) {
        return `${prefix}${baseName}`
    } else {
        return baseName;
    }
}
  
function getStyleguideTextStylesCode(options, containerAndType, textStyles) {
	return textStyles.map(style => {
		return `  static const ${camelize(style.name)} = ${getStyle(options, containerAndType, style)}`;
	});
}

function getTextSpan(options, containerAndType, content, textStyle, styleMap) {
    return `TextSpan(
    style: ${getStyle(options, containerAndType, textStyle, styleMap)},
    text: "${content}")`;
}

function getTextSpans(options, containerAndType, content, textStyles, styleMap) {
    return textStyles.map( textStyle => {
        var str = content.substring(textStyle.range.start, textStyle.range.end+1);

        return getTextSpan(options, containerAndType, str, textStyle.textStyle, styleMap)
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

function handleBorder(borderRadius, borders, fills, colorMap, options) {
    var attrs = [];
    if (borderRadius != 0) {
        attrs.push(`borderRadius: BorderRadius.all(
            Radius.circular(${borderRadius}) 
        )`);
    }
    var color = getColorByMap({r: 0, b: 0, g: 0, a: 255}, colorMap, options);
    var width = 1;
    if (borders.length != 0) {
        var borderAttrs = [];
        var border = borders[0];
        if (border.fill.type == "color") {
            color = getColorByMap(border.fill.color, colorMap, options);
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
    var fill = handleFill(fills, colorMap, options);
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

function handleFill(fills, colorMap, options) {
    if (fills.length == 0) {
        return ""
    }
    var color = "";
    var width = 1;
    if (fills.length != 0) {
        var fill = fills[0];
        if (fill.type == "color") {
            color = getColorByMap(fill.color, colorMap, options);
        }
    }
    if (color == "") {
        return "";
    }
    return `color: ${color},`
}

function getColorByMap(color, colorMap, options) {
    var formattedColor = getColor(color);
    if (formattedColor in colorMap) {
        return `${getConfigName("Colors", options)}.${colorMap[formattedColor]}`;
    }
    return formattedColor;
}

function getStyleMap(containerAndType, useLinkedStyleguides) {
    var { container, type } = containerAndType;

    var containerStyles = getResources(container, type, useLinkedStyleguides, "textStyles");
    return containerStyles.reduce((styleMap, style) => {

        var styleWithoutName = Object.assign({}, style);
        delete styleWithoutName.name;
        delete styleWithoutName.scaledFontSize;
        var styleString = JSON.stringify(styleWithoutName).replace("\\", "");
        /*
            We don't want to override already set keys because
            colors are supplied from bottom to top (first from local styleguide then linked styleguide then styleguides from children to parent)
        */
       styleMap[styleString] = styleMap[styleString] ? styleMap[styleString] : camelize(style.name);
        return styleMap;
    }, {});
}

function getColorMap(containerAndType, useLinkedStyleguides) {
    var { container, type } = containerAndType;

    var containerColors = getResources(container, type, useLinkedStyleguides, "colors");
    return getColorMapByFormat(containerColors, null); // We only have one color format in Flutter
}

function getLayerCode(containerAndType, layer, options) {
    var { container, type } = containerAndType;
    var { useLinkedStyleguides, classPrefix, divisor } = options;

    if (divisor == null || divisor == 0) {
        divisor = 1;
    }

    debugLog(layer);

    var colorMap = getColorMap(containerAndType, useLinkedStyleguides)
    var styleMap = getStyleMap(containerAndType, useLinkedStyleguides)

    var elements = []
    var code = "";

	if (layer.type == "text") {
        var content = layer.content
        if (layer.textStyles.length > 1) {
            var textSpans = getTextSpans(options, containerAndType, content, layer.textStyles, styleMap).join(",\n      ");
            code = `RichText(
  text: TextSpan(
    children: [
      ${textSpans}
    ]
  )
)`;
         } else if (layer.textStyles.length == 1) {

            var style = getStyle(options, containerAndType, layer.textStyles[0].textStyle, styleMap);
            // textStyle.textAlign : String Horizontal alignment of the text style, left, right, center, or justify.
            var alignment = layer.textStyles[0].textStyle.textAlign;
            code = `Text(
"${content}",
textAlign: TextAlign.${alignment},
style: ${style})`;
         }

         if (layer.rect.width != 0 && layer.rect.height != 0) {
             code = `SizedBox(
                width: ${layer.rect.width / divisor}.0,
                height: ${layer.rect.height/ divisor}.0,
                child: ${code}
             )`
         }

         //return code;
    } else if (layer.type == "shape") {
        var border = handleBorder(layer.borderRadius, layer.borders, layer.fills, colorMap, options);
        code = `Container(
    width: ${layer.rect.width / divisor}.0,
    height: ${layer.rect.height/ divisor}.0,
    ${border}
)`;

    } else if (layer.type == "group") {
        debugLog(layer);
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
