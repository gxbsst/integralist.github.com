## integralist.co.uk

Moved over to the Jekyll static content generator system.

All blog posts are written in Markdown.

# Dependencies

jekyll ~1.1.2

## Start Jekyll

`jekyll build`
`jekyll serve --watch`

The `serve` command will start up localhost on port 4000: `http://localhost:4000/`

Remember to generate your Pygment CSS file: `pygmentize -S default -f html > Assets/Styles/pygment.css` - run from root directory

## Image Optimising

You can either try using ImageMagick along with Optipng:

```
convert -resize 1024 nameOfFile.png nameOfFile_1024.png
optipng -o7 nameOfFile_1024.png
```

Alternatively you can use the Grunt task with implements the responsive images
grunt task to generate multiple image sizes automatically for us
