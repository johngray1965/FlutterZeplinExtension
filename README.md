# Zeplin Flutter Extension

Generates Flutter dart snippets from colors, text styles, layers.

Sample color output:
```dart
class colors {
        
  static const medium_blue = const Color(0xff2e72b6);
  static const dull_orange = const Color(0xffdda831);
  static const greyish_brown = const Color(0xff585858);
  static const black = const Color(0xff0c0c0c);
  static const white = const Color(0xffffffff);
        
}
```

Sample text style output:
```dart
class styles {
        
  static const listPrice = const TextStyle(
    color:  colors.black,
    fontWeight: FontWeight.w700,
    fontFamily: "Arimo",
    fontStyle:  FontStyle.normal,
    fontSize: 36.0
  );

  static const listTitle = const TextStyle(
    color:  colors.black,
    fontWeight: FontWeight.w400,
    fontFamily: "Arimo",
    fontStyle:  FontStyle.normal,
    fontSize: 36.0
  );

  static const buttonTextStyle = const TextStyle(
    color:  colors.white,
    fontWeight: FontWeight.w400,
    fontFamily: "Arimo",
    fontStyle:  FontStyle.normal,
    fontSize: 36.0
  );

  static const subTitle = const TextStyle(
    color:  colors.black,
    fontWeight: FontWeight.w400,
    fontFamily: "Arimo",
    fontStyle:  FontStyle.normal,
    fontSize: 24.0
  );
    
}
```

Sample layer output:
```dart
new Text(
   "Some Random Text",
   style: styles.subTitle);
```

## Options:

#### Color/Style class name prefix

Prefixes the default color and style class names.

## Development

React Native extension is developed using [zem](https://github.com/zeplin/zem), Zeplin Extension Manager. zem is a command line tool that lets you quickly create and test extensions.

To learn more about zem, [see documentation](https://github.com/zeplin/zem).

