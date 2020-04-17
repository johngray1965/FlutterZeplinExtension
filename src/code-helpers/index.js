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
    pascalize,
    debugLog,
    indent
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
  child: 
    ${indent(code)},
)`;
}

function handlePositioned(code, rect) {
    return `PositionedDirectional(
  top: ${rect.y},
  start: ${rect.x},
  child: 
    ${indent(code)},
)`;
}

function handleOpacity(code, opacity) {
    if (opacity == 1) {
        return code;
    }
    return `Opacity(
  opacity : ${opacity},
  child: ${indent(code)},
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

function handleGradient(gradient, colorMap, options) {
    var colors = [];
    var i;
    for (i = 0; i < gradient.colorStops.length; i++) { 
        //debugLog(`gradient.colorStops[${i}].color = ${JSON.stringify(gradient.colorStops[i].color)}`);
        colors.push(getColorByMap(gradient.colorStops[i].color, colorMap, options));
    }

    return `LinearGradient(
  begin: Alignment(${gradient.from.x}, ${gradient.from.y}),
  end: Alignment(${gradient.to.x}, ${gradient.to.y}),
  colors: [${colors.join(", ")}])`;
}

function handleBoxShadow(shadow, colorMap, options) {
    return `BoxShadow(
        color: ${getColorByMap(shadow.color, colorMap, options)},
        offset: Offset(${shadow.offsetX},${shadow.offsetY}),
        blurRadius: ${shadow.blurRadius},
        spreadRadius: ${shadow.spread}
    )`;
}
function handleBoxDecoration(borderRadius, borders, fills, shadows, colorMap, options) {
    var attrs = [];
    if (borderRadius != 0) {
        attrs.push(`  borderRadius: BorderRadius.all(
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
            borderAttrs.push(`  color: ${color}`)
        // } else if (border.fill.type == "gradient") {
        //     color = handleGradient(border.fill.gradient, colorMap, options);
        //     borderAttrs.push(`  gradient: ${color}`)
        }
        if (border.thickness != null) {
            width = border.thickness;
            borderAttrs.push(`  width: ${width}`)
        }
        attrs.push(`border: Border.all(
            ${borderAttrs.join(",\n")}
          )`)
    }
    if (shadows != null && shadows.length != 0) {
        attrs.push(`  boxShadow: [${shadows.map(
            shadow => {
                return  handleBoxShadow(shadow, colorMap, options)
            }
            ).join(", ")}] `);
    }

    var fill = handleFill(fills, colorMap, options);
    if (fill.length != 0) {
        attrs.push(fill);
    }
    if (attrs.length > 0) {
        return `  decoration: BoxDecoration(
${indent(attrs.join(",\n"))}
)`;
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
            if (color == "") {
                return "";
            }
            return `  color: ${color}`;
        } else if (fill.type == "gradient") {
            color = handleGradient(fill.gradient, colorMap, options);
            return `  gradient: ${color}`;
        }
    }
    return "";
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

// Generate the code for a single layer
function processLayer(containerAndType, layer, options, child, usePositioned, useFullScreen) {
    var { container, type } = containerAndType;
    var { useLinkedStyleguides, classPrefix, divisor } = options;
    var handleScreens = options[OPTION_NAMES.HANDLE_SCREENS];

    if (divisor == null || divisor == 0) {
        divisor = 1;
    }

    if (layer == null) {
        return "";
    }

    debugLog("processLayer");

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

            var attrs = [];
            attrs.push(`"${content}"`);
            var style = getStyle(options, containerAndType, layer.textStyles[0].textStyle, styleMap);
            attrs.push(`style: ${style}`);
            // textStyle.textAlign : String Horizontal alignment of the text style, left, right, center, or justify.
            var alignment = layer.textStyles[0].textStyle.textAlign;
            if (alignment != null && alignment != "undefined") {
                attrs.push(`textAlign: TextAlign.${alignment}`);
            }
            code = `Text(
${attrs.join(",\n")}                
)`;
         }

         if (layer.rect.width != 0 && layer.rect.height != 0 && handleScreens == true) {
             code = `SizedBox(
  width: ${layer.rect.width / divisor},
  height: ${layer.rect.height/ divisor},
  child: ${indent(code)}
             )`
         }

         //return code;
    } else if (layer.type == "shape") {
        attrs = [];

        if (useFullScreen != true) {
            attrs.push(`  width: ${layer.rect.width / divisor}`);
            attrs.push(`  height: ${layer.rect.height/ divisor}`);
        }
    
        var boxDecoration = handleBoxDecoration(layer.borderRadius, layer.borders, layer.fills, layer.shadows, colorMap, options);
        if (boxDecoration.length > 0) {
            attrs.push(boxDecoration);
        }
        var childWidget = "";
        if (child != null) {
            attrs.push(`  child: ${child}`);
        }
        code = `Container(
${attrs.join(",\n")}
)`;

        if (layer.rotation != 0) {
            code = `Transform.rotate(
                angle: ${layer.rotation * Math.PI/180},
                child: ${code}
              )`
         }

        if (useFullScreen == true) {
            code = `Center(
  child: ${code}
)`
        }

    } else if (layer.type == "group") {
        if (layer.layers.length > 1) {
        var children = [];
        var i;
        for (i = 0; i < layer.layers.length; i++) { 
            child = processLayer(containerAndType, layer.layers[i], options, null, true);
            if (child.length > 0) {
                children.push(indent(child));
            }
        }
        code = `Stack(children: [
${children.join(",\n")}
])`;
        } else {
            code = processLayer(containerAndType, layer.layers[0], options);
        }
        if (layer.rect.width != 0 && layer.rect.height != 0 && handleScreens == true) {
            code = `SizedBox(
 width: ${layer.rect.width / divisor},
 height: ${layer.rect.height/ divisor},
 child: ${indent(code)}
            )`
        }

    }

    if (usePositioned == null && code.length > 0 && handleScreens == true) {
        code = handlePadding(code, layer.rect)
    }
    code = handleOpacity(code, layer.opacity)
    // if (code.length != 0) {
    //     return code;
    // }
    if (usePositioned == true && code.length > 0) {
        code = handlePositioned(code, layer.rect)
    }

    if (code.length > 0) {
        code = `// ${layer.name} \n` + code;
    }


    return code; // + "\n\n" + JSON.stringify(layer, null, 2);
}

function processLayerList(containerAndType, layers, options, useFullScreen) {
    debugLog("processLayerList\n");
    if (layers.length == 1) {
        debugLog("processLayerList A\n");
        return processLayer(containerAndType, layers[0], options, false, useFullScreen);
    } else if (layers.length == 2) {
        debugLog("processLayerList B\n");
        var child = indent(processLayer(containerAndType, layers[1], options, null));
        //debugLog(`child ${child}`);
        return processLayer(containerAndType, layers[0], options, child, false, useFullScreen);
    } else {
        debugLog("processLayerList C\n");
        var children = [];
        var i;
        for (i = 1; i < layers.length; i++) { 
            child = processLayer(containerAndType, layers[i], options, null, true);
            if (child.length > 0) {
                children.push(indent(child));
            }
        }
        child = `Stack(children: [
${children.join(",\n")}
])`;
        return processLayer(containerAndType, layers[0], options, child, false, useFullScreen);
    }
  
}
// Handle a layer request.  This will call processLayer to 
// generate the code for individual layers, and assemble
// them
function getLayerCode(containerAndType, layer, options) {

    var handleScreens = options[OPTION_NAMES.HANDLE_SCREENS];

    debugLog("getLayerCode\n");

    debugLog(layer);

    if (layer.parent != null && layer.parent.layers != null && handleScreens == true) {
        return processLayerList(containerAndType, layer.parent.layers, options);
    } else if (layer.version != null && layer.version.layers != null && handleScreens == true) {
        debugLog("getLayerCode A\n");
        return processLayerList(containerAndType, layer.version.layers, options);
    } else {
        debugLog("getLayerCode B\n");
        return processLayer(containerAndType, layer, options);
    }
}

function getComponent(containerAndType, selectedVersion, selectedComponent, options) {
    var d = {
        containerAndType: containerAndType,
        selectedVersion: selectedVersion,
        selectedComponent: selectedComponent,
        options: options,
    }
    debugLog("getComponent");
    debugLog(d);
    return generateStatelessWidget(selectedComponent.name, processLayerList(containerAndType, selectedVersion.layers, options));
}

function getScreen(containerAndType, selectedVersion, selectedScreen, options) {
    var handleScreens = options[OPTION_NAMES.HANDLE_SCREENS];

    if (handleScreens == true) {
        var d = {
            containerAndType: containerAndType,
            selectedVersion: selectedVersion,
            selectedScreen: selectedScreen,
            options: options,
        }
        debugLog("getScreen");
        debugLog(d);
        return generateStatelessWidget(selectedScreen.name, processLayerList(containerAndType, selectedVersion.layers, options, true));
    } else {
        return "";
    }

}

function generateStatelessWidget(name, child) {
    return `
class ${pascalize(name)} extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ${indent(indent(indent(child)))};
  }
}
`;
}

export {
    getStyleguideColorsCode,
    getStyleguideTextStylesCode,
    getLayerCode,
    getComponent,
    getScreen,
};
