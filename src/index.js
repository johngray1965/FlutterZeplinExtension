/**
 * Export functions you want to work with, see documentation for details:
 * https://github.com/zeplin/zeplin-extension-documentation
 */

var HEX_BASE = 16;
var MAX_BRIGHTNESS = 255;

function getTextSpan(context, content, textStyle) {
    return `new TextSpan(
        style: ${getStyle(context, textStyle)},
        text: "${content}")`;
}

function getTextSpans(context, content, textStyles) {
    return textStyles.map( textStyle => {
        var str = content.substring(textStyle.range.start, textStyle.range.end+1);

        return getTextSpan(context, str, textStyle.textStyle)
    });
}

function layer(context, layer) {
    var elements = []
    var code = "";

	if (layer.type == "text") {
        var content = layer.content
        if (layer.textStyles.length > 1) {
            var textSpans = getTextSpans(context, content, layer.textStyles).join(",\n      ");
		    code = `new RichText(
  text: new TextSpan(
    children: [
      ${textSpans}
    ]
  )
);`;
         } else if (layer.textStyles.length == 1) {

            var style = getStyle(context, layer.textStyles[0].textStyle);
            code = `new Text(
    "${content}",
    style: ${style});`;

         }

         return {
             code: code,
             language: "dart"
         };
    }
}

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

function getColor(context, color, force) {
	var projectColor = context.project.findColorEqual(color)
	if (projectColor && !force) {
	    return `${getColorClassName(context)}.${projectColor.name}`
	} else {
    	return `const Color(${toHexString(color)})`;
	}
}

function getStyleguideColorTexts(context, colors) {
	return colors.map(color => {
		return `  static const ${color.name} = ${getColor(context, color, true)}`;
	});
}

function styleguideColors(context, colors) {
	var styleguideColorTexts = getStyleguideColorTexts(context, colors);
	var code = `${styleguideColorTexts.join(";\n")};`;
     return {
        code: code,
        language: "dart"
     };
}

function getStyle(context, style, force) {
	var projectStyle = context.project.findTextStyleEqual(style)
	if (projectStyle && !force) {
	    return `${getStyleClassName(context)}.${camelize(projectStyle.name)}`
	} else {

        var elements = [];

        //return JSON.stringify(style, null, 2)
        if ('color' in style) {
            elements.push(`    color:  ${getColor(context, style.color)}`);
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
            elements.push(`    fontSize: ${(style.fontSize/2).toFixed(1)}`);
        }

        return `const TextStyle(
${elements.join(",\n")}
  )`;
    }
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function getStylebuildTextStyles(context, styles) {
	return styles.map(style => {

		return `  static const ${camelize(style.name)} = ${getStyle(context, style, true)}`;
	});
}

function getColorClassName(context) {
    var prefix = context.getOption('classPrefix')
    if (prefix && prefix !== "") {
        return `${prefix}Colors`;
    } else {
        return "colors";
    }
}

function getStyleClassName(context) {
    var prefix = context.getOption('classPrefix')
    if (prefix && prefix !== "") {
        return `${prefix}Styles`;
    } else {
        return "styles";
    }
}

function styleguideTextStyles(context, styles) {
//    var code = JSON.stringify(styles, null, 2)
	var styleguideStyles = getStylebuildTextStyles(context, styles);
	var code =  `${styleguideStyles.join(";\n\n")};`;

     return {
        code: code,
        language: "dart"
     };
}

function exportStyleguideColors(context, colors) {
    var codeObject = styleguideColors(context, colors);
    var innerCode = codeObject.code;

    var code = `import 'package:flutter/material.dart';

class ${getColorClassName(context)} {

${innerCode}

}
`;

    return {
        code: code,
        filename: `${getColorClassName(context)}.dart`,
        language: "dart"
    };
}

function exportStyleguideTextStyles(context, textstyles) {
    var codeObject = styleguideTextStyles(context, textstyles);
    var innerCode = codeObject.code;

    var code = `import 'dart:ui';

class ${getStyleClassName(context)} {

    ${innerCode}

}
`;

    return {
        code: code,
        filename: `${getStyleClassName(context)}.dart`,
        language: "dart"
    };

}

function comment(context, text) {
	return `// ${text}`;
}

export default {
    layer,
    styleguideColors,
    styleguideTextStyles,
    exportStyleguideColors,
    exportStyleguideTextStyles,
    comment
};
