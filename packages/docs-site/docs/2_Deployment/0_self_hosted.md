---
title: Self Hosting
description: Remastered can be used as any Node.js server. You can host it on any platform. Heroku, DigitalOcean, AWS, you name it
---

Remastered can be used as any Node.js server. You can host it on any platform. Heroku, DigitalOcean, AWS, you name it.

Once you have your projects working locally, you can hit the `build` command:

```bash
$ remastered build
```

And then serve it:

```bash
$ remastered serve
```

And that's it! You're good to go!

### Tips and Tricks

#### Add npm scripts

It is much preferred to add the following scripts to your `package.json`, so other contributors and deployment targets will be able to build your projects easily:

```json
{
  "scripts": {
    "build": "remastered build",
    "start": "remastered serve"
  }
}
```
