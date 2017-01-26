Contributing
=====

This documentation is automatically generated and updated with `GitBook`, when any PR gets merged into master.

## Development

To start editing the documentation, run the following:

```bash
$ npm run docs:watch
```

This will setup a live preview of the documentation on your localhost. It will automatically build a website and
re-load it when changes are detected on the filesystem.

## Deployment

The website is automatically deployed by TravisCi during the build step. However, one can manually trigger the following:

```bash
$ npm run docs:publish
```

in order to build and send the docs to `gh-pages` branch manually.

## Adding a new page

There are few steps and conventions involved when it comes to creating a new page.

### Making a file

First thing to do is to create a file. Think of where you want to place a new page of the docs. There are two rules of thumb one should follow.

#### Single-page

If you want to create a single-page, e.g. under `contributing` section, you have to create a file inside `docs/contributing` folder.
Give it a `PascalCase` name of the heading you will put inside it.

Example:

```
docs/contributing/HowTo.md
```

and inside `HowTo.md`

```md
# How to
```

#### Sub-page

If you want to either create a sub-page of another page (say from previous example) or a new section with sub-items, you have to create a folder that will have `Readme.md` inside it.
Naming conventions are the same as in the previous section.

Example:

```
docs/contributing/howto/Readme.md
```

and inside `Readme.md`

```md
# How to
```

This example is going to look and work exactly like the `single-page` example with a difference that this one (sub-page one) can contain children, e.g:

```
docs/contributing/howto/CreatingAPage.md
```

and inside `CreatingAPage.md`

```md
# Creating a page
```

### Link your page

The above naming conventions are just to make it easier to locate a file and change its content.

In order to actually include the page on the docs, one should open `Summary.md` and add newly created page/folder to the nested list that's already there.

Simply put, the list in `Summary.md` should directly reflect the structure in the `docs` folder.