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

#### Handle Screens?  Warning, this can be very cpu intensive

Handle Screens.  This generates a lot of code, and make zeplin rather slow.

#### Display resources from linked and parent styleguides

Use stylesguides.

## Disclaimer.

While this extension will generate code for much of your Zeplin design, you should consider the code that’s generated a starting point, and not production code.  The extension generates code from the design fairly faithfully.  That’s often not the best solution.  A good example is a simple button.  The design likely has a colored box, probably with rounded corners and a fixed size.  With text in the box that’s sized and padded so the text appears in the center of the box.  The extension will follow that closely be generating a Container with rounded corners of the right size (which is okay so far), then it’ll create the text with size and padding specified in the design.  Not so good.  If I were to code this up by hand, it’ll not give the text a fixed size or padding, I’d just wrap it with a Center widget.  The problem with the sizes in the text is that if you change the size the button, you also have to adjust the size and padding of the text to keep it centered. The plugin isn’t smart enough to see that’s a better solution, it just does what the design says.

The bottom line is that plugin will create a lot of hard coded sizes.  You should really work to rewrite what it generates without many hard coded sizes.

In the end you should consider what it generates to be starting point, its not going to write your app for you.

Images

We don’t get very good metadata on the icons/images.  We just end up creating a container with the right size and position, you’ll need to add a child to the container with the icon/image.



## Development

Flutter extension is developed using [zem](https://github.com/zeplin/zem), Zeplin Extension Manager. zem is a command line tool that lets you quickly create and test extensions.

To learn more about zem, [see documentation](https://github.com/zeplin/zem).

Flutter extension is open source, you can find it on [github](https://github.com/johngray1965/FlutterZeplinExtension).

