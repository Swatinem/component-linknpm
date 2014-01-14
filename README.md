# component-linknpm

Link downloaded components into node_modules

## Installation

    $ npm install component-linknpm

## Rationale

Creating components which work both across node and the browser is quite a mess.
One of the inconveniences is that one has to use two package managers and deal
with the incompatibilities of the two, such as the lack of namespaces in npm.
One workaround for this is to publish a `component/emitter` component as
`emitter-component` on npm. This however leads to confusion and workarounds such
as this:

```js
var Emitter;
try {
	Emitter = require('emitter'); // component
} catch (e) {
	Emitter = require('emitter-component'); // node
}
```

`component-linknpm` tries to work around this issue by simply symlinking
everything that is in `./components/` to `./node_modules/`.
I know is is far from being a good solution, but it works for my purposes so
far.

**note**: This is still very incomplete, for example, it does not handle
sub-dependencies yet.

## Usage

    $ component install # download the components
    $ component linknpm # symlink them to ./node_modules/

## License

  LGPLv3

