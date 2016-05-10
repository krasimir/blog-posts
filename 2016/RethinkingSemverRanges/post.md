# Thoughts on semantic versioning, npm and JavaScript ecosystem as a whole

If you are front-end developer dealing with single page applications you probably know that JavaScript ecosystem is not perfect at all. A few things may go wrong and break your build. In this article I'll go through those *features*. Features which are, by my humble opinion, problematic.

## Semantic versioning

[Semantic versioning](http://semver.org/) is a way to describe what is our release about. It's a version number that by specification has three groups - Major.Minor.Patch. While we write a module and publish it on [npm](https://docs.npmjs.com/getting-started/semantic-versioning) (Node.js's package manager) we use semantic versioning to say what we've changed. 

> * Bug fixes and other minor changes: Patch release, increment the last number, e.g. 1.0.1
> * New features which don't break existing features: Minor release, increment the middle number, e.g. 1.1.0
> * Changes which break backwards compatibility: Major release, increment the first number, e.g. 2.0.0

We have these simple rules and we have to follow them so we provide a sane updates of our work. Especially today, where most of the complex JavaScript apps are *house of cards*. We have lots of dependencies and these dependencies have their own dependencies and so on.

Here is what currently broke my build. Indeed it was fixed quickly but it was still frustrating.

Our project has the following dependencies in its `package.json` file:

```
{
  "devDependencies": {
    "browserify": "~13.0.0",
    "karma-browserify": "~5.0.1"
  }
}
```

It was fine for months. We run `npm install` lots of times locally and on our servers. However, a new version of `browserify` is published. Nothing big, just a patch release and the new one becomes `13.0.1`. Then we suddenly started getting builds failures. We didn't change anything, it was working in the morning and it doesn't work after lunch. The error that appeared in the terminal was:

```
error code EPEERINVALID
error peerinvalid The package browserify@13.0.1 does not satisfy its siblings' peerDependencies requirements!
error peerinvalid Peer karma-browserify@5.0.4 wants browserify@>=10.0.0 <=13.0.0
```

The message is pretty clear. We opened the `package.json` file of `karma-browserify` and we found:

```
"devDependencies": {
  "browserify": "^13.0.0",
  ...
},
"peerDependencies": {
  "browserify": ">=10.0.0 <=13.0.0",
  ...
}
```

And because we used `~13.0.0` we got `13.0.1` which is not satisfying `>=10.0.0 <=13.0.0` requirement. The fix from our side was to use a strict version (`13.0.0`) of browserify or quickly to use strict version of karma-browserify (`5.0.5` ) where the issue is resolved by bumping the peer dependency to `">=10 <14"`.

And here I started to think that the flexibility of npm's semver and semver ranges are not always a good thing. To be honest I don't like using `~` or `^` or versions like `2.3.x`. I prefer relying on specific version. I see the points of having these features which are around the idea that you can get fixes and improvements almost for free. No need to update your `package.json` file. You get the latest and the greatest version of your dependency. Well, we all know that that's not the case. I ended up with the following conclusions:

* Not everyone is following semantic versioning strictly. There are cases we see a patch release that contains breaking changes.
* I personally don't care about bug fixes. I like of course to use a bug-free software but I prefer to rely on stable libraries and if I hit a bug I'll check if it is fixed, in which versions and what this version comes up with. Many times I got a new release downloaded that fixes a bug in a feature that I'm not using at all. So, I prefer strict versioning where I install the same version every time. We are all now fans of pure functions right. *A pure function always returns the same result given same parameters.* Well, `npm install` is definitely not a pure-ish process.
* 


