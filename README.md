# Integralist

This is the website for www.integralist.co.uk and is built using the Node static
site generator CabinJS

## Install

`npm install -g cabin grunt-cli`
`bundle install`**

**you'll need to have Bundler pre-installed. If you don't then simply run `gem install bundler`

## CabinJS

I've already run the command required to create a blog using CabinJS, but in
case you were wondering it was: `cabin new blog CabinJS/Candy`.

'blog' is the destination folder I wanted to create and 'CabinJS/Candy' is the
username/repo on GitHub for it to locate a theme to use.

You can manually update the theme and that's what I've done in this instance.
I've modified it to suit my needs.

After I create a new blog via CabinJS it asked me which template engine I wanted
to use, and I chose EJS as it's much nicer (IMO) than Jade.

To run the blog just move inside the blog directory and run Grunt: `cd blog && grunt`
