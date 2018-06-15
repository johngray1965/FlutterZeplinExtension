# Zeplin Flutter Extension

Generates Flutter dart snippets from colors, text styles, layers.

Sample color output:
```dart
class Colors {
  static const medium_blue = const Color(0xff2e72b6);
  static const dull_orange = const Color(0xffdda831);
  static const greyish_brown = const Color(0xff585858);
  static const black = const Color(0xff0c0c0c);
  static const white = const Color(0xffffffff);
  static const black_two = const Color(0xff000000);
  static const black_three = const Color(0xff020202);
}```

Sample text style output:
```dart
class Styles {
        
  static const listPrice = const TextStyle(
    color:  Colors.black,
    fontWeight: FontWeight.w700,
    fontFamily: "Arimo",
    fontStyle:  FontStyle.normal,
    fontSize: 36.0
  );

  static const listTitle = const TextStyle(
    color:  Colors.black,
    fontWeight: FontWeight.w400,
    fontFamily: "Arimo",
    fontStyle:  FontStyle.normal,
    fontSize: 36.0
  );

  static const buttonTextStyle = const TextStyle(
    color:  Colors.white,
    fontWeight: FontWeight.w400,
    fontFamily: "Arimo",
    fontStyle:  FontStyle.normal,
    fontSize: 36.0
  );

  static const subTitle = const TextStyle(
    color:  Colors.black,
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
   style: Styles.subTitle);
```

## Options:

#### Color/Style class name prefix

Prefixes the default color and style class names.

## Development

Flutter extension is developed using [zem](https://github.com/zeplin/zem), Zeplin Extension Manager. zem is a command line tool that lets you quickly create and test extensions.

To learn more about zem, [see documentation](https://github.com/zeplin/zem).

Flutter extension is open source, you can find it on [github](https://github.com/johngray1965/FlutterZeplinExtension).

