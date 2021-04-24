# Font-GIS
*Icon font set for use with GIS and spatial analysis tools*

I've collected in this repo icons and graphics I've been using in my projects.
Font-GIS icons and font theme is designed mainly for GIS applications and web map tools. 

## Getting started

### NPM package
*work in progress*

### using Font-GIS
You can use Font-GIS as a font or as SVG symbols or images.

To use it in a web page, just add the css in your project.
```html
<link href="https://viglino.github.io/font-gis/css/font-gis.css" rel="stylesheet" />
```
Then use an inline element with a class prefixed with `fg-` to add a new icon.
```html
<i class="fg-poi"></i> <!-- prefix: fg and - icon name: poi -->
<span class="fg-polyline-pt"></span> <!-- using a <span> is more semantically correct but a little bit verbose. -->
```
Or use it as an image (svg are in the `./dist` folder):
```html
<img src="[path-to-svg]/poi.svg" />
```
<img src="https://github.com/Viglino/font-gis/blob/main/dist/poi.svg" height="30" />

## Contributing
Please use the [GitHub issue tracker](https://github.com/Viglino/font-gis/issues) to ask for new features 
or create a pull request.    
Font is created from the files in the `./svg` folder, you only have to create a new file in this folder. 
Use the `./templates/template.svg` template to create a new icon.  
You can add a new glyph in the [font-gis.json](https://github.com/Viglino/font-gis/blob/main/font-gis.json) file with a theme and search tags 
(other fields will be fill automatically).

Your contribution will be published under [Font-GIS license](https://github.com/Viglino/font-gis/blob/main/LICENSE.md) as per [GitHub's terms of service](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license).

## Licenses
Copyright (c) 2021 Jean-Marc Viglino

[Font-GIS](https://viglino.github.io/font-gis/) is free, open source, and GPL friendly. 
You can use it for commercial projects, open source projects, or really almost whatever you want.
[Read full Font-GIS license](https://github.com/Viglino/font-gis/blob/main/LICENSE.md)

* Font-GIS font is licensed under the [SIL OFL 1.1 License](https://github.com/Viglino/font-gis/blob/main/LICENSE-OFL.md)
* Icons and SVG files are licensed under the [CC BY 4.0 License](https://github.com/Viglino/font-gis/blob/main/LICENSE-CC-BY.md)
* Codes and all non font or icon files are licensed under the [MIT License](https://github.com/Viglino/font-gis/blob/main/LICENSE-MIT.md)

Attribution is required by MIT, SIL OFL, and CC BY licenses. Font-GIS files already 
contain embedded comments with sufficient attribution, so you shouldn't need to 
do anything additional when using these files normally.
