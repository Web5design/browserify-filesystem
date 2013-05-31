Shamelessly canabalized from https://github.com/brianloveswords/filesystem-browserify/blob/master/package.json

# browserify-filesystem

A (partial) implementation of
[node's `fs`](http://nodejs.org/docs/latest/api/fs.html) in the browser. On its own, everything is stored in memory and lost on close. Intended to be used with an attached adapter to read/write from a db or remote API.

# available adapters

none. hah.

# imaginary adapters

* browserify-filesystem-idb
* browserify-filesystem-leveldb
* browserify-filesystem-dropbox

# what's implemented

* `fs.readdir`
* `fs.readFile`
* `fs.writeFile`
* `fs.unlink`
* `fs.rename`
* `fs.createReadStream`
* `fs.createWriteStream`

# tests

I need 'em.
