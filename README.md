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