# Thoughts on semantic versioning, npm and JavaScript ecosystem as a whole

If you are front-end developer dealing with single page applications you probably know that JavaScript ecosystem is not perfect at all. A few things may go wrong and break your build. In this article I'll go through those *features*. Features which are, by my humble opinion, problematic.

## Semantic versioning

[Semantic versioning](http://semver.org/) is a way to describe what is our release about. It's a version number that by specification has three groups - Major.Minor.Patch. While we write a module and publish it on [npm](https://docs.npmjs.com/getting-started/semantic-versioning) (Node.js's package manager) we use semantic versioning to say what we've changed. 

> * Bug fixes and other minor changes: Patch release, increment the last number, e.g. 1.0.1
> * New features which don't break existing features: Minor release, increment the middle number, e.g. 1.1.0
> * Changes which break backwards compatibility: Major release, increment the first number, e.g. 2.0.0

We have these simple rules and we have to follow them so we provide a sane updates of our work. Especially today, where most of the complex JavaScript apps are *house of cards* this is really important. We have lots of dependencies and these dependencies have their own dependencies and so on.

Here is what currently broke our build:

Our project has the following dependencies in its `package.json` file:

```
{
  "devDependencies": {
    "browserify": "~13.0.0",
    "karma-browserify": "~5.0.1"
  }
}
```

It was fine for months. We run `npm install` lots of times locally and on our servers. However, a new version of `browserify` was published. Nothing big, just a patch release and the new one became `13.0.1`. Then we suddenly started getting builds failures. We didn't change anything, it was working in the morning and it didn't after lunch. The error that appeared in the terminal was:

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

And because we used `~13.0.0` we got `13.0.1` which is not satisfying `>=10.0.0 <=13.0.0` requirement. The fix from our side was to use a strict version (`13.0.0`) of browserify or quickly use strict version of karma-browserify (`5.0.5`) where the issue is resolved by bumping the peer dependency to `">=10 <14"`.

And here I started thinking that the flexibility of npm's semver and semver ranges are not always a good thing. To be honest I don't like using `~` or `^` or versions like `2.3.x`. I prefer relying on specific versions. I see the points of having these features which are around the idea that we can get fixes and improvements almost for free. We don't have to update our `package.json` file. We get the latest and the greatest version of our dependency without explicitly asking for it. Well, we all know that that's not the case. I ended up with the following conclusions:

* Not everyone is following semantic versioning strictly. There are cases where we see a patch release that contains breaking changes. Or minor release that is adding a feature but breaks an existing one.
* I personally don't care about bug fixes. I like of course using a bug-free software but I prefer to rely on stable libraries and if I hit a bug I'll check if it is fixed, in which versions and what this version comes up with. Many times I got a new release downloaded fixing a bug in a feature that I never used. So, I prefer strict versioning where I install the same version every time. Version that I know it works. We are all now fans of pure functions right. *A pure function always returns the same result given same parameters.* Well, `npm install` is definitely not a pure-ish process.

## What about the package manager 

`npm` as a tool is awesome. Don't get me wrong. I like it and I use it every day. However, there are some areas which need tweaking and features that are bringing more problems then solving.

### Peer dependencies

The issue above was caused by [peer dependencies](https://nodejs.org/en/blog/npm/peer-dependencies/) definition in `karma-browserify`. The `peerDependencies` property allows us to specify modules that our library depends on. It's widely used in the cases where we have a tool and plugins to it. The plugins obviously work with specific version of the host package. The idea is not bad but:

* I don't want to see my build failing because of this. Warning is fine but not failing. If the there is something broken I'll probably see it in the process after that (when I run my `build` script).
* It's probably fine saying "My plugin works with version 10". But is adding a range like `>=10.0.0 <=13.0.0` a good approach. Without a super clear roadmap of the main module how you know that your plugin is compatible with version 12. That's a fairly big assumption.

### Post-install scripts

[Post-install](https://docs.npmjs.com/misc/scripts) scripts are handy when we want to perform an action after our module is downloaded on the client's machine. It's very often used for compiling native code or producing transpiled code. There are modules that depend on C++ libraries. So, the most common approach is to get the code and compile it once it is downloaded so we get the binary which is later used from node. My problem here is that the process is slow and it needs some additional stuff installed. Locally it's probably fine because we have powerful machines but in my virtual machine or the development servers it takes time.

Instead of compiling C++ code I would suggest to download the binary from a trusted source. Like it's done in `phantomjs-prebuilt` package [here](https://github.com/Medium/phantomjs). It may take few minutes but it's just downloading, not compiling.

## The dependency tree hell

I was using Windows before and sometimes when I wanted to delete the `node_modules` folder I wasn't able to do it. The reason was because the file path was so long that Windows [can't handle it](https://github.com/npm/npm/issues/3697). So many folders nested to each other. I think we all agree that JavaScript and node exploded in the last years and there are new modules published all the time. We saw what happen with the [kik package drama](http://krasimirtsonev.com/blog/article/the-earthquake-in-the-javascript-community). And to be honest the problem is not in npm. It's in us. We tend to create modules for everything. We got this decision not npm. The giant net of packages that we use as a base for our applications is not really stable.

I have few ideas that are floating in my mind recently:

* We should try minimizing the dependencies in our modules. Less dependencies, less modules to download, less problems.
* We should really distribute a bundle. If our node module is pure JavaScript why not merged it into a single file with a bundler like browserify. Then the consumer of the package will install zero dependencies of our work. No tree at all, no conflicts.
* We should start using `.npmignore` and stop publishing files that are not needed. This will speed up the `npm install` command.









