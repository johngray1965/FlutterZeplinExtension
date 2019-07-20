import {
    getStyleguideColorsCode,
    getStyleguideTextStylesCode,
    getLayerCode,
    getComponent,
    getScreen
} from "./code-helpers";
import { OPTION_NAMES } from "./constants";
import { getResourceContainer, getResources, debugLog } from "./utils";

// for a component we'll emit a StatelessWidget
function component(context, selectedVersion, selectedComponent) {
    // var f = {
    //     contcext: context,
    //     selectedVersion: selectedVersion,
    //     selectedComponent: selectedComponent
    // };
    var containerAndType = getResourceContainer(context);
    var options = {
        useLinkedStyleguides: context.getOption(OPTION_NAMES.USE_LINKED_STYLEGUIDES),
        classPrefix: context.getOption(OPTION_NAMES.CLASS_PREFIX),
        divisor: context.project.densityDivisor
    };
    var code = getComponent(containerAndType, selectedVersion, selectedComponent, options);

    return {
        code: code,
        language: "dart"
    };

    //debugLog(f);
}

// for a screen we'll emit a StatelessWidget here too
function screen(context, selectedVersion, selectedScreen) {
    var containerAndType = getResourceContainer(context);
    var options = {
        useLinkedStyleguides: context.getOption(OPTION_NAMES.USE_LINKED_STYLEGUIDES),
        classPrefix: context.getOption(OPTION_NAMES.CLASS_PREFIX),
        divisor: context.project.densityDivisor,
        handleScreens: context.getOption(OPTION_NAMES.HANDLE_SCREENS)
    };
    var code = getScreen(containerAndType, selectedVersion, selectedScreen, options);

    return {
        code: code,
        language: "dart"
    };
}

function colors(context) {
    var useLinkedStyleguides = context.getOption(OPTION_NAMES.USE_LINKED_STYLEGUIDES);
    var { container, type } = getResourceContainer(context);
    var allColors = getResources(container, type, useLinkedStyleguides, "colors");
    var options = { 
        classPrefix: context.getOption(OPTION_NAMES.CLASS_PREFIX),
        divisor: context.project.densityDivisor
    };
    var code = getStyleguideColorsCode(options, allColors);

    return {
        code: code,
        language: "dart"
    };
}

function textStyles(context) {
    var options = {
        useLinkedStyleguides: context.getOption(OPTION_NAMES.USE_LINKED_STYLEGUIDES),
        classPrefix: context.getOption(OPTION_NAMES.CLASS_PREFIX),
        divisor: context.project.densityDivisor
    };
    var containerAndType = getResourceContainer(context);
    var { container, type } = containerAndType;
    var allTextStyles = getResources(container, type, options.useLinkedStyleguides, "textStyles");
    var code = getStyleguideTextStylesCode(options, containerAndType, allTextStyles);

    return {
        code: code,
        language: "dart"
    };
}

function layer(context, selectedLayer) {
    var containerAndType = getResourceContainer(context);
    var options = {
        useLinkedStyleguides: context.getOption(OPTION_NAMES.USE_LINKED_STYLEGUIDES),
        classPrefix: context.getOption(OPTION_NAMES.CLASS_PREFIX),
        divisor: context.project.densityDivisor
    };
    var code = getLayerCode(containerAndType, selectedLayer, options);

    return {
        code: code,
        language: "dart"
    };
}

function comment(context, text) {
    return `// ${text}`;
}

function exportColors(context) {
    var codeObject = colors(context);
    var code = codeObject.code;

    return {
        code: code,
        filename: "colors.dart",
        language: "dart"
    };
}

function exportTextStyles(context) {
    var codeObject = textStyles(context);
    var code = codeObject.code;

    return {
        code: code,
        filename: "fonts.dart",
        language: "dart"
    };
}

function styleguideColors(context, colorsInProject) {
    var options = { 
        classPrefix: context.getOption(OPTION_NAMES.CLASS_PREFIX),
        divisor: context.project.densityDivisor
    };
    var code = getStyleguideColorsCode(options, colorsInProject);
    return {
        code,
        language: "dart"
    };
}

function styleguideTextStyles(context, textStylesInProject) {
    var options = {
        classPrefix: context.getOption(OPTION_NAMES.CLASS_PREFIX),
        divisor: context.project.densityDivisor
    };
    var containerAndType = getResourceContainer(context);
    var code = getStyleguideTextStylesCode(options, containerAndType, textStylesInProject);
    return {
        code,
        language: "dart"
    };
}

function exportStyleguideColors(context, colorsInProject) {
    var codeObject = styleguideColors(context, colorsInProject);
    var code = codeObject.code;
    return {
        code,
        filename: "colors.dart",
        language: "dart"
    };
}

function exportStyleguideTextStyles(context, textStylesInProject) {
    var codeObject = styleguideTextStyles(context, textStylesInProject);
    var code = codeObject.code;
    return {
        code,
        filename: "fonts.dart",
        language: "dart"
    };
}

export default {
    layer,
    screen,
    component,
    colors,
    textStyles,
    comment,
    exportColors,
    exportTextStyles,
    styleguideColors,
    styleguideTextStyles,
    exportStyleguideColors,
    exportStyleguideTextStyles
};
