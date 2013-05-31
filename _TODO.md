== NOW ==

== fs core ==

-Handle paths, dir, and symlink lookups
-Implement fs module methods in example.js one by one until victory
-cosnider/implement/use fs module's remaining Classes:
* fs.Stats
* fs.FSWatcher

== PseudoStore ==

-consider using https://github.com/davidwood/cachetree

-save and retrieve hierarchy via put(0) and get(0) (maybe?)

-have objectStore hold elements by id (look at idb)
-create a filesystem/tree that references ids in the objectStore

-Rename PseudoStore to InMemoryStore or something
-Seperate PseudoStore into a seperate module and add as a dev dep

== General ==

-Determine minimum api for FS-DB Adapters
-Return to async
-update readme
-publish alll the packages!

== NOTES ==

It seems the memory store is more about caching, which is especially handy for when your primary store is accessed via remote api calls to dropbox etc

So it might be an integral part of the fs implementation as oposed to a oft-ignored/default-only variety of memory store

Though an evolving isseus will be memory management

UNIX file I/O uses the following basic system calls:
open
close
creat
read
write
lseek - set the current position pointer for the file
dup

minimal api for adding a data-store -- file system sits on top of a key-value store

put
get
getIds
remove
- - -
clear -> getIds.each remove
getAll -> getIds.each get
copy -> put get